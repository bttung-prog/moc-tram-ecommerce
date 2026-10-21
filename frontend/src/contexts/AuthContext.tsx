import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { authApi } from '@/services/authApi';
import { PERMISSIONS, type PermissionCode } from '@/constants/permissions';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requiresMfa: boolean; tempToken?: string }>;
  verifyMfa: (tempToken: string, otp: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; phone: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: PermissionCode) => boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authApi.getStoredUser<User>();
    if (stored && authApi.getToken()) {
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    if (!result.success || !result.data) throw new Error(result.message);
    if (result.data.requiresMfa) {
      return { requiresMfa: true, tempToken: result.data.tempToken };
    }
    setUser(result.data.user as User);
    return { requiresMfa: false };
  };

  const verifyMfa = async (tempToken: string, otp: string) => {
    const result = await authApi.verifyMfa({ tempToken, otp });
    if (!result.success || !result.data) throw new Error(result.message);
    setUser(result.data as User);
  };

  const register = async (data: { email: string; password: string; fullName: string; phone: string }) => {
    const result = await authApi.register(data);
    if (!result.success || !result.data) throw new Error(result.message);
    setUser(result.data as User);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const hasPermission = (code: PermissionCode): boolean => {
    if (!user) {
      const allowed = PERMISSIONS[code] as readonly string[];
      return allowed.includes('GUEST');
    }
    const allowed = PERMISSIONS[code] as readonly string[];
    // MANAGE includes VIEW — if user has MANAGE, they also have VIEW
    const role = user.role as UserRole;
    return allowed.includes(role);
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem('moctram_user', JSON.stringify(u));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyMfa, register, logout, hasPermission, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
