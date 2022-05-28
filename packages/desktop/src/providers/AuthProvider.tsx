import { Button, Container } from '@mui/material';
import React, { useContext, useEffect, useCallback } from 'react';

import { FcGoogle } from 'react-icons/fc';
import { blueGrey } from '@mui/material/colors';
import Channels from '../electron/constants';
import { firebaseAuth } from '../firebase/connect';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GoogleAuthProvider();

provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

interface IAuthContext {
  user?: any;
}

const AuthContext = React.createContext<IAuthContext>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    window.electronAPI.once(Channels.GOOGLE_AUTH_TOKENS, async (tokens: any) => {
      console.log('got tokens', tokens);

      //   realmApp.logIn(credentials).then((user) => alert(`Logged in with id: ${user.id}`));
    });
  }, []);

  return <Login />;

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

const Login = () => {
  // take user to browser to complete authentication
  const handleLogin = useCallback(() => {
    // send to main process
    // window.electronAPI.auth.initiateLogin();

    signInWithPopup(firebaseAuth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        console.log(result);
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
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
