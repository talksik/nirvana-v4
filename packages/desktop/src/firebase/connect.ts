// eslint-disable-next-line import/no-unresolved
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import devConfig from './config/firebase.dev.config.json';

export const firebaseApp = initializeApp(devConfig);

export const firebaseAuth = getAuth(firebaseApp);

// Initialize Cloud Firestore and get a reference to the service
export const firestoreDb = getFirestore(firebaseApp);
