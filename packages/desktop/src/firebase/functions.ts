import { getFunctions, httpsCallable } from 'firebase/functions';

import TwilioAccessToken from '@nirvana/core/src/functions/response/TwilioAccessToken.response';

const functions = getFunctions();

export const getTwilioAccessToken = httpsCallable(functions, 'getStreamToken');
