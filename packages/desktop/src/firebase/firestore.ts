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
  writeBatch,
  collectionGroup,
} from 'firebase/firestore';

import { User as FirebaseUser } from 'firebase/auth';
import { firestoreDb } from './connect';
import { User } from '@nirvana/core/src/models/user.model';
import Conversation, {
  ConversationMember,
  MemberRole,
  MemberState,
} from '@nirvana/core/src/models/conversation.model';

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

// const collectionGroupPoint = <T extends Document>(collectionPath: string) =>
//   firestoreDb && collectionGroup(getFirestore(), collectionPath).withConverter(converter<T>());

const db = {
  users: collectionPoint<User>(`users`),
  user: (userId: string) => docPoint<User>(`users/${userId}`),
  conversations: collectionPoint<Conversation>(`conversations`),
  conversation: (conversationId: string) =>
    docPoint<Conversation>(`conversations/${conversationId}`),
  conversationMembers: collectionPoint<ConversationMember>(`conversationMembers`),
  conversationMember: () => docPoint<ConversationMember>(`conversationMembers`),
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

// get conversation members for all conversations that I am in
export const getUserConversationMembersQueryLIVE = (userId: string) => {
  return query(db.conversationMembers, where('userId', '==', userId));
};

// get all conversation members for a conversation
export const getConversationMembersQueryLIVE = (conversationId: string) => {
  return query(db.conversationMembers, where('conversationId', '==', conversationId));
};

// get document reference for specific conversation
export const getConversationQueryLIVE = (conversationId: string) => {
  return db.conversation(conversationId);
};

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
  try {
    const newConversation = new Conversation(myUserId);
    const newDocConversationInserted = await addDoc(db.conversations, newConversation);

    const batch = writeBatch(firestoreDb);

    // create all members
    const adminMember = new ConversationMember(
      myUserId,
      newDocConversationInserted.id,
      MemberRole.admin,
      MemberState.priority,
      null,
    );
    const otherMember = new ConversationMember(
      otherUserId,
      newDocConversationInserted.id,
      MemberRole.regular,
      MemberState.inbox,
      null,
    );

    batch.set(db.conversationMember(), adminMember);
    batch.set(db.conversationMember(), otherMember);

    await batch.commit();

    return newDocConversationInserted.id;
  } catch (e) {
    console.error('Error creating user: ', e);

    throw new Error('Error creating user');
  }
};

export const createGroupConversation = async (
  otherUserIds: string[],
  myUserId: string,
): Promise<string> => {
  try {
    const newConversation = new Conversation(myUserId);
    const newDocConversationInserted = await addDoc(db.conversations, newConversation);

    const batch = writeBatch(firestoreDb);

    const adminMember = new ConversationMember(
      myUserId,
      newDocConversationInserted.id,
      MemberRole.admin,
      MemberState.priority,
      null,
    );
    batch.set(db.conversationMember(), adminMember);

    // create all members
    otherUserIds.forEach((otherUserId) => {
      const otherMember = new ConversationMember(
        otherUserId,
        newDocConversationInserted.id,
        MemberRole.regular,
        MemberState.inbox,
        null,
      );

      batch.set(db.conversationMember(), otherMember);
    });

    await batch.commit();

    return newDocConversationInserted.id;
  } catch (e) {
    console.error('Error creating user: ', e);

    throw new Error('Error creating user');
  }
};
