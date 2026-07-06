import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/constants/Roles';

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

export const DEMO_ACCOUNTS: Array<{
  label: string;
  role: string;
  email: string;
  password: string;
  color: string;
  initials: string;
}> = [
  { label: 'Dr. Rosa Bautista', role: 'Principal', email: 'principal@school.edu', password: 'admin123', color: '#800020', initials: 'RB' },
  { label: 'Mr. Juan Dela Cruz', role: 'Teacher', email: 'teacher@school.edu', password: 'teacher123', color: '#1565C0', initials: 'JD' },
  { label: 'Ms. Ana Reyes', role: 'ADAS', email: 'adas@school.edu', password: 'adas123', color: '#2E7D32', initials: 'AR' },
  { label: 'Ms. Liza Cruz', role: 'Secretary', email: 'secretary@school.edu', password: 'secretary123', color: '#6A1B9A', initials: 'LC' },
];

const MOCK_USERS: Record<string, User & { password: string }> = {
  'principal@school.edu': {
    id: '1',
    name: 'Dr. Rosa Bautista',
    role: 'principal',
    email: 'principal@school.edu',
    password: 'admin123',
    department: 'School Administration',
  },
  'teacher@school.edu': {
    id: '2',
    name: 'Mr. Juan Dela Cruz',
    role: 'teacher',
    email: 'teacher@school.edu',
    password: 'teacher123',
    subject: 'Mathematics',
    gradeLevel: 'Grade 7',
    department: 'Junior High School',
  },
  'adas@school.edu': {
    id: '3',
    name: 'Ms. Ana Reyes',
    role: 'adas',
    email: 'adas@school.edu',
    password: 'adas123',
    department: 'Academic Affairs',
  },
  'secretary@school.edu': {
    id: '4',
    name: 'Ms. Liza Cruz',
    role: 'secretary',
    email: 'secretary@school.edu',
    password: 'secretary123',
    department: 'Administrative Office',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600));
    const record = MOCK_USERS[email.toLowerCase()];
    if (record && record.password === password) {
      const { password: _pw, ...userData } = record;
      setUser(userData);
      return true;
    }
    return false;
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
