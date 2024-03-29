//TODO: move all of this to core or common and separate out files

import Conversation, {
  ConversationMember,
  MemberMap,
  MemberRole,
  MemberState,
} from '@nirvana/core/src/models/conversation.model';
import {
  FieldValue,
  QueryDocumentSnapshot,
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  updateDoc,
  where,
} from 'firebase/firestore';

import { ContentBlock } from '@nirvana/core/src/models/content.model';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '@nirvana/core/src/models/user.model';
import { firestoreDb } from './connect';
import { toTitleCase } from '../util/text';
import useAuth from '../providers/AuthProvider';

interface Document {
  id: string;
}

/**
 * UTILS
 */
// TODO: strong type checking so that string queries are actually querying fields that are in our models

const converter = <T extends Document>() => ({
  toFirestore: (data: T) => ({ ...data }),
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as T;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    data.id = snap.id;

    return data;
  },
});

const docPoint = <T extends Document>(collectionPath: string) =>
  firestoreDb && doc(getFirestore(), collectionPath).withConverter(converter<T>());

const collectionPoint = <T extends Document>(collectionPath: string) =>
  firestoreDb && collection(getFirestore(), collectionPath).withConverter(converter<T>());

const db = {
  users: collectionPoint<User>(`users`),
  user: (userId: string) => docPoint<User>(`users/${userId}`),
  conversations: collectionPoint<Conversation>(`conversations`),
  conversation: (conversationId: string) =>
    docPoint<Conversation>(`conversations/${conversationId}`),

  conversationContent: (conversationId: string) =>
    collectionPoint<ContentBlock>(`conversations/${conversationId}/content`),
};

// enum COLLECTION {
//   users = 'users',
// }

export const createUser = async (user: FirebaseUser) => {
  try {
    await setDoc(
      db.user(user.uid),
      new User(
        user.uid,
        user.providerId,
        user.email,
        user.displayName,
        user.photoURL,
        user.phoneNumber,
      ),
      { merge: true },
    );
  } catch (e) {
    console.error('Error creating user: ', e);

    throw new Error('Error creating user');
  }
};

export const searchUsers = async (searchQuery: string): Promise<User[] | undefined> => {
  try {
    const emaildocSearchQuery = query(
      db.users,
      orderBy('email'),
      startAt(searchQuery.toLowerCase()),
      endAt(searchQuery.toLowerCase() + '\uf8ff'),
      limit(5),
    );

    const nameManipulatedQuery = toTitleCase(searchQuery);
    const nameSearchQuery = query(
      db.users,
      orderBy('displayName'),
      startAt(nameManipulatedQuery),
      endAt(nameManipulatedQuery + '\uf8ff'),
      limit(5),
    );

    const emailquerySnap = await getDocs(emaildocSearchQuery);
    const namequerySnap = await getDocs(nameSearchQuery);

    const nameQueryResults = namequerySnap.docs.map((doc) => doc.data());
    const emailQueryResults = emailquerySnap.docs.map((doc) => doc.data());

    // remove duplicates
    return [
      ...nameQueryResults,
      ...emailQueryResults.filter(
        (userResult) =>
          !nameQueryResults.find((userFromNameQuery) => userResult.id === userFromNameQuery.id),
      ),
    ];
  } catch (e) {
    console.error('Error: ', e);

    throw new Error('Error');
  }
};

export const getUserById = async (userId: string): Promise<User | undefined> => {
  const docSnap = await getDoc(db.user(userId));

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // doc.data() will be undefined in this case
    console.log('No such user!');
  }

  return undefined;
};

// get the conversations for particular user
export const getConversationsQueryLIVE = (userId: string) =>
  query(db.conversations, where(`members.${userId}.isActive`, '==', true));

// get content blocks for particular conversation
export const getConversationContentQueryLIVE = (conversationId: string) =>
  query(db.conversationContent(conversationId), orderBy('createdDate', 'desc'));

/**
 *
 * @param otherUserId
 * @param myUserId
 * @returns id of new conversation
 */
export const createOneOnOneConversation = async (
  otherUser: User,
  currentUser: User,
): Promise<string> => {
  try {
    const myMember = new ConversationMember(currentUser.id, MemberRole.admin, MemberState.inbox);
    const otherMember = new ConversationMember(otherUser.id, MemberRole.regular, MemberState.inbox);

    const newMemberMap: MemberMap = {
      [currentUser.id]: { ...myMember },
      [otherUser.id]: { ...otherMember },
    };

    const userCache: User[] = [{ ...currentUser }, { ...otherUser }];
    const membersList = [currentUser.id, otherUser.id];

    const newConversation = new Conversation(currentUser.id, membersList, newMemberMap, userCache);

    const newDoc = await addDoc(db.conversations, newConversation);
    return newDoc.id;
  } catch (e) {
    console.error('Error: ', e);

    throw new Error('Error');
  }
};

export const createGroupConversation = async (
  otherUsers: User[],
  adminUser: User,
  conversationName: string | null,
): Promise<string> => {
  try {
    const userCache = [{ ...adminUser }];

    const myMember = new ConversationMember(adminUser.id, MemberRole.admin, MemberState.inbox);

    const newMemberMap: MemberMap = {
      [adminUser.id]: { ...myMember },
    };

    otherUsers.forEach((otherUser) => {
      const otherMember = new ConversationMember(
        otherUser.id,
        MemberRole.regular,
        MemberState.inbox,
      );

      newMemberMap[otherUser.id] = { ...otherMember };

      userCache.push({ ...otherUser });
    });

    const membersList = [adminUser.id, ...otherUsers.map((otherUser) => otherUser.id)];
    const newConversation = new Conversation(
      adminUser.id,
      membersList,
      newMemberMap,
      userCache,
      conversationName,
    );

    const newConversationDoc = await addDoc(db.conversations, newConversation);
    return newConversationDoc.id;
  } catch (e) {
    console.error('Error : ', e);

    throw new Error('Error ');
  }
};

export const sendContentBlockToConversation = async (
  contentBlock: ContentBlock,
  conversationId: string,
) => {
  try {
    await addDoc(db.conversationContent(conversationId), contentBlock);
  } catch (e) {
    console.error('Error  ', e);

    throw new Error('Error ');
  }
};

// put the user in membersInroom
export const joinConversation = async (conversationId: string, userId: string) => {
  try {
    await updateDoc(db.conversation(conversationId), {
      [`membersInRoom`]: arrayUnion(userId),
      [`members.${userId}.lastActiveDate`]: serverTimestamp(),
    });
  } catch (e) {
    console.error('Error ', e);

    throw new Error('Error');
  }
};

// leave membersInroom
export const leaveConversation = async (conversationId: string, userId: string) => {
  try {
    await updateDoc(db.conversation(conversationId), {
      [`membersInRoom`]: arrayRemove(userId),
      [`members.${userId}.lastActiveDate`]: serverTimestamp(),
    });
  } catch (e) {
    console.error('Error ', e);

    throw new Error('Error');
  }
};
