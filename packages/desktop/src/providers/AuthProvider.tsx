import { Button, Container } from '@mui/material';
import {
  User as FirebaseUser,
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithCredential,
  updateCurrentUser,
} from 'firebase/auth';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { createUser, getUserById } from '../firebase/firestore';

import Channels from '../electron/constants';
import CircularProgress from '@mui/material/CircularProgress';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { FcGoogle } from 'react-icons/fc';
import NirvanaLogo from '../components/NirvanaLogo';
import { User } from '@nirvana/core/src/models/user.model';
import { blueGrey } from '@mui/material/colors';
import { firebaseAuth } from '../firebase/connect';
import { useSnackbar } from 'notistack';

interface IAuthContext {
  user?: FirebaseUser;
  nirvanaUser?: User;
  logout?: () => void;
}

const AuthContext = React.createContext<IAuthContext>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { enqueueSnackbar } = useSnackbar();

  // since auth.currentuser isn't updating
  const [currentUser, setCurrentUser] = useState<FirebaseUser>(null);
  const [currentNirvanaUser, setCurrentNirvanaUser] = useState<User>(null);

  // are we still waiting on initial auth to trigger?
  const [authIniting, setAuthIniting] = useState<boolean>(true);

  useEffect(() => {
    const authListener = onAuthStateChanged(firebaseAuth, async (user) => {
      console.log('auth changed!!!!', user);

      if (user) {
        // getting from our data store of users
        let fetchedNirvanaUser = await getUserById(user.uid);

        if (!fetchedNirvanaUser) {
          await createUser(user);

          fetchedNirvanaUser = await getUserById(user.uid);
        }

        setCurrentNirvanaUser(fetchedNirvanaUser);

        setCurrentUser(user);
      } else {
        // User is signed out
        // ...
        enqueueSnackbar('Logged out');
        setCurrentUser(null);
      }

      setAuthIniting(false);
    });

    return () => authListener();
  }, [setCurrentUser, enqueueSnackbar, setAuthIniting, setCurrentNirvanaUser]);

  useEffect(() => {
    const tokenListener = window.electronAPI.once(
      Channels.GOOGLE_AUTH_TOKENS,
      async (tokens: Credentials) => {
        setAuthIniting(true);

        console.log('got tokens', tokens);

        const credential = GoogleAuthProvider.credential(tokens.id_token);

        setPersistence(firebaseAuth, browserLocalPersistence)
          .then(() => {
            // Sign in with credential from the Google user.
            return signInWithCredential(firebaseAuth, credential).then((result) => {
              // This gives you a Google Access Token. You can use it to access Google APIs.
              const credential = GoogleAuthProvider.credentialFromResult(result);
              const token = credential.accessToken;

              // The signed-in user info.
              const user = result.user;
              console.log(user);
              updateCurrentUser(firebaseAuth, user);
            });
          })
          .catch((error: any) => {
            setAuthIniting(false);

            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The credential that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...

            enqueueSnackbar('Something went wrong', { variant: 'error' });
          });
      },
    );

    return () => tokenListener();
  }, [enqueueSnackbar, setAuthIniting]);

  const logout = useCallback(() => firebaseAuth.signOut(), []);

  if (authIniting)
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
        <CircularProgress />
      </Container>
    );

  if (!currentUser || !currentNirvanaUser) return <Login />;

  return (
    <AuthContext.Provider value={{ user: currentUser, logout, nirvanaUser: currentNirvanaUser }}>
      {children}
    </AuthContext.Provider>
  );
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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        background: blueGrey[50],
      }}
    >
      <NirvanaLogo />
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
