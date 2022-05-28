//TODO: move all of this to core or common and separate out files

import {
  setDoc,
  getFirestore,
  doc,
  collection,
  QueryDocumentSnapshot,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';

import { User as FirebaseUser } from 'firebase/auth';

/**
 * UTILS
 */
const converter = <T>() => ({
  toFirestore: (data: T) => ({ ...data }),
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

const dataPoint = <T>(collectionPath: string) =>
  doc(getFirestore(), collectionPath).withConverter(converter<T>());

const db = {
  user: (userId: string) => dataPoint<User>(`users/${userId}`),
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
