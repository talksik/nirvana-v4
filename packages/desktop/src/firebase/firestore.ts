//TODO: move all of this to core or common and separate out files

import {
  setDoc,
  getFirestore,
  doc,
  collection,
  QueryDocumentSnapshot,
  Timestamp,
  FieldValue,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAt,
  endAt,
  addDoc,
  arrayUnion,
  updateDoc,
  arrayRemove,
} from 'firebase/firestore';

import { User as FirebaseUser } from 'firebase/auth';
import { firestoreDb } from './connect';
import { User } from '@nirvana/core/src/models/user.model';
import Conversation, {
  ConversationMember,
  MemberMap,
  MemberRole,
  MemberState,
} from '@nirvana/core/src/models/conversation.model';
import useAuth from '../providers/AuthProvider';
import { ContentBlock } from '@nirvana/core/src/models/content.model';

interface Document {
  id: string;
}

/**
 * UTILS
 */
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

    const nameSearchQuery = query(
      db.users,
      orderBy('displayName'),
      startAt(searchQuery.toLocaleUpperCase()),
      endAt(searchQuery.toLocaleUpperCase() + '\uf8ff'),
      limit(5),
    );

    const emailquerySnap = await getDocs(emaildocSearchQuery);
    const namequerySnap = await getDocs(nameSearchQuery);

    return [
      ...emailquerySnap.docs.map((doc) => doc.data()),
      ...namequerySnap.docs.map((doc) => doc.data()),
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
  otherUserId: string,
  myUserId: string,
): Promise<string | undefined> => {
  const myMember = new ConversationMember(myUserId, MemberRole.admin, MemberState.inbox);
  const otherMember = new ConversationMember(otherUserId, MemberRole.regular, MemberState.inbox);

  const newMemberMap: MemberMap = {
    [myUserId]: { ...myMember },
    [otherUserId]: { ...otherMember },
  };
  const newConversation = new Conversation(myUserId, [myUserId, otherUserId], newMemberMap);

  try {
    const newDoc = await addDoc(db.conversations, newConversation);
    return newDoc.id;
  } catch (e) {
    console.error('Error: ', e);

    throw new Error('Error');
  }
};

export const createGroupConversation = async (
  otherUserIds: string[],
  myUserId: string,
): Promise<void> => {
  const myMember = new ConversationMember(myUserId, MemberRole.admin, MemberState.inbox);

  const newMemberMap: MemberMap = {
    [myUserId]: { ...myMember },
  };

  otherUserIds.forEach((otherMemberId) => {
    const otherMember = new ConversationMember(
      otherMemberId,
      MemberRole.regular,
      MemberState.inbox,
    );
    newMemberMap[otherMemberId] = { ...otherMember };
  });

  const newConversation = new Conversation(myUserId, [myUserId, ...otherUserIds], newMemberMap);

  try {
    await addDoc(db.conversations, newConversation);
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
    await updateDoc(db.conversation(conversationId), { membersInRoom: arrayUnion(userId) });
  } catch (e) {
    console.error('Error ', e);

    throw new Error('Error');
  }
};

// leave membersInroom
export const leaveConversation = async (conversationId: string, userId: string) => {
  try {
    await updateDoc(db.conversation(conversationId), { membersInRoom: arrayRemove(userId) });
  } catch (e) {
    console.error('Error ', e);

    throw new Error('Error');
  }
};
