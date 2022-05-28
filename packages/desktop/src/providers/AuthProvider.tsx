import React, { useContext } from 'react';
import Realm from 'realm';

interface IAuthContext {
  user?: Realm.User;
}

const AuthContext = React.createContext<IAuthContext>({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  return useContext(AuthContext);
};

export default useAuth;
