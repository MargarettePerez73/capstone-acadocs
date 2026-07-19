import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/constants/Roles';
import { authAPI } from '@/services/api';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  subject?: string;
  gradeLevel?: string;
  department?: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo accounts match the users seeded into the `acadocs_mobile` DB by setup.php.
// (username / password: acadocs2024)
export const DEMO_ACCOUNTS: Array<{
  label: string;
  role: string;
  email: string;
  password: string;
  color: string;
  initials: string;
}> = [
  { label: 'Dr. Rosa Bautista', role: 'Principal', email: 'r.bautista@school.edu.ph', password: 'acadocs2024', color: '#800020', initials: 'RB' },
  { label: 'Juan Santos', role: 'Teacher', email: 'j.santos@school.edu.ph', password: 'acadocs2024', color: '#1565C0', initials: 'JS' },
  { label: 'Maria Reyes', role: 'ADAS', email: 'm.reyes@school.edu.ph', password: 'acadocs2024', color: '#2E7D32', initials: 'MR' },
  { label: 'Carmen Dela Cruz', role: 'Secretary', email: 'c.delacruz@school.edu.ph', password: 'acadocs2024', color: '#6A1B9A', initials: 'CC' },
];

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
        department: u.department,
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
