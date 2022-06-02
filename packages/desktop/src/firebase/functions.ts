import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export const getTwilioAccessToken = httpsCallable(functions, 'getStreamToken');
