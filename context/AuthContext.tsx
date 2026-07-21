import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/constants/Roles';
import { authAPI } from '@/services/api';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  photo?: string | null;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authAPI.login(email.trim(), password);
      const u = data.user;
      if (!u || !u.id) return false;
      setUser({
        id: String(u.id),
        name: u.name,
        role: u.role,
        email: u.email,
        photo: u.photo ?? null,
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
