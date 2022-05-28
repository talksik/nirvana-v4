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
} from 'firebase/firestore';

import { User as FirebaseUser } from 'firebase/auth';
import { firestoreDb } from './connect';

/**
 * UTILS
 */
const converter = <T>() => ({
  toFirestore: (data: T) => ({ ...data }),
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

const docPoint = <T>(collectionPath: string) =>
  firestoreDb && doc(getFirestore(), collectionPath).withConverter(converter<T>());

const collectionPoint = <T>(collectionPath: string) =>
  firestoreDb && collection(getFirestore(), collectionPath).withConverter(converter<T>());

const db = {
  users: collectionPoint<User>(`users`),
  user: (userId: string) => docPoint<User>(`users/${userId}`),
};

export class User {
  lastUpdatedDate?: Timestamp;

  constructor(
    public uid: string,
    public providerId: string,
    public email: string,
    public displayName?: string,
    public photoUrl?: string,
    public phoneNumber?: string,
    public createdDate: Timestamp = Timestamp.now(),
  ) {}
}

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
      where('email', '>=', searchQuery.toUpperCase()),
      where('email', '<=', searchQuery.toUpperCase() + '\uf8ff'),
    );

    const nameSearchQuery = query(
      db.users,
      where('displayName', '>=', searchQuery.toUpperCase()),
      where('displayName', '<=', searchQuery.toUpperCase() + '\uf8ff'),
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
