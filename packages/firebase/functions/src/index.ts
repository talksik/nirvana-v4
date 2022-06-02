import * as functions from 'firebase-functions';
import * as twilio from 'twilio';

import TwilioAccessToken from './core/functions/response/TwilioAccessToken.response';

const AccessToken = twilio.jwt.AccessToken;
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const VideoGrant = AccessToken.VideoGrant;

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const getStreamToken = functions.https.onCall((data, context) => {
  // Used when generating any kind of tokens
  // To set up environmental variables, see http://twil.io/secure
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioApiKey = process.env.TWILIO_API_KEY;
    const twilioApiSecret = process.env.TWILIO_API_SECRET;

    if (!twilioAccountSid || !twilioApiKey || !twilioApiSecret) {
      functions.logger.error('no twilio access tokens!!!');

      return;
    }

    const identity = 'user';

    // Create Video Grant
    const videoGrant = new VideoGrant();

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret, {
      identity: identity,
    });

    token.addGrant(videoGrant);

    functions.logger.info(`${context.auth?.uid} user granted a stream access token`);

    // Serialize the token to a JWT string
    return new TwilioAccessToken(token.toJwt());
  } catch (error) {
    functions.logger.error(error);
    return undefined;
  }
});
