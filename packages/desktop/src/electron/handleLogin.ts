import Channels, { STORE_ITEMS } from './constants';

import ElectronGoogleOAuth2 from '@getstation/electron-google-oauth2';
import { browserWindow } from '../index';

const myApiOauth = new ElectronGoogleOAuth2(
  '423533244953-banligobgbof8hg89i6cr1l7u0p7c2pk.apps.googleusercontent.com',
  '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',
  [''],
  { successRedirectURL: 'https://usenirvana.com' },
);

// FRESH GOOGLE LOGIN
export async function handleGoogleLogin() {
  const tokens = await myApiOauth.openAuthWindowAndGetTokens();

  browserWindow.webContents.send(Channels.GOOGLE_AUTH_TOKENS, tokens);
}
