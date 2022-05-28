import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { Button, Container } from '@mui/material';
import React, { useContext, useEffect, useCallback } from 'react';

import { FcGoogle } from 'react-icons/fc';
import { blueGrey } from '@mui/material/colors';
import Channels from '../electron/constants';
import { firebaseAuth } from '../firebase/connect';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

const provider = new GoogleAuthProvider();

provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

interface IAuthContext {
  user?: any;
}

const AuthContext = React.createContext<IAuthContext>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    window.electronAPI.once(Channels.GOOGLE_AUTH_TOKENS, async (tokens: Credentials) => {
      console.log('got tokens', tokens);

      const credential = GoogleAuthProvider.credential(tokens.id_token);

      // Sign in with credential from the Google user.
      signInWithCredential(firebaseAuth, credential)
        .then((result) => {
          // This gives you a Google Access Token. You can use it to access Google APIs.
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential.accessToken;

          // The signed-in user info.
          const user = result.user;
          console.log(user);
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
          // The email of the user's account used.
          const email = error.email;
          // The credential that was used.
          const credential = GoogleAuthProvider.credentialFromError(error);
          // ...
        });
    });
  }, []);

  return <Login />;

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

const Login = () => {
  // take user to browser to complete authentication
  const handleLogin = useCallback(() => {
    // send to main process
    window.electronAPI.auth.initiateLogin();
  }, []);

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        background: blueGrey[50],
      }}
    >
      <Button onClick={handleLogin} variant="outlined" color="primary" startIcon={<FcGoogle />}>
        Continue with Google
      </Button>
    </Container>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
