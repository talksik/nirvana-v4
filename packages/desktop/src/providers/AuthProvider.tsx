import React from 'react';
import Realm from 'realm';

interface IAuthContext {
  user?: Realm.User;
}

const AuthContext = React.createContext<IAuthContext>({});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
