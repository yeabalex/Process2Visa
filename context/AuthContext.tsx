'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  authorized: boolean | null;
  chatId: string | null;
  setAuthState: (auth: { authorized: boolean; chatId: string | null }) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const setAuthState = ({ authorized, chatId }: { authorized: boolean; chatId: string | null }) => {
    setAuthorized(authorized);
    setChatId(chatId);
  };

  return (
    <AuthContext.Provider value={{ authorized, chatId, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
