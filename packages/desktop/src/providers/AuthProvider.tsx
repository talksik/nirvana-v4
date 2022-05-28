import { Button, Container } from '@mui/material';
import React, { useContext, useEffect, useCallback } from 'react';
import Realm from 'realm';
import realmApp from '../realm/connect';

import { FcGoogle } from 'react-icons/fc';
import { blueGrey } from '@mui/material/colors';
import Channels from '../electron/constants';

interface IAuthContext {
  user?: Realm.User;
}

const AuthContext = React.createContext<IAuthContext>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    window.electronAPI.once(Channels.GOOGLE_AUTH_TOKENS, async (tokens: any) => {
      console.log('got tokens', tokens);
      //   const credentials = Realm.Credentials.google(tokens);
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
