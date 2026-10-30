import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { User, UserRole } from "@/types";
import { authApi } from "@/services/authApi";
import { PERMISSIONS, type PermissionCode } from "@/constants/permissions";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ requiresMfa: boolean; tempToken?: string }>;
  verifyMfa: (tempToken: string, otp: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => Promise<{ email: string; message: string }>;
  verifyRegisterOtp: (email: string, otp: string) => Promise<User>;
  resendRegisterOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (code: PermissionCode) => boolean;
  updateUser: (user: User) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = authApi.getStoredUser<User>();
    if (stored && authApi.getToken()) {
      setUser(stored);
      // Gọi ngầm lên backend để kiểm tra token và đồng bộ dữ liệu mới nhất
      authApi
        .getProfile()
        .then((res) => {
          if (res.success && res.data) {
            setUser(res.data);
          } else if (!authApi.getToken()) {
            setUser(null);
          }
        })
        .catch(() => {
          // Lỗi mạng, tiếp tục dùng dữ liệu offline/stored
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    if (!result.success || !result.data) throw new Error(result.message);
    if (result.data.requiresMfa) {
      return { requiresMfa: true, tempToken: result.data.tempToken };
    }
    setUser(result.data.user);
    return { requiresMfa: false };
  };

  const verifyMfa = async (tempToken: string, otp: string) => {
    void tempToken;
    void otp;
    // Tương thích với interface cũ
    setUser(authApi.getStoredUser<User>());
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => {
    const result = await authApi.register(data);
    if (!result.success) throw new Error(result.message);
    return {
      email: data.email,
      message: result.message || "Mã OTP đã được gửi về email của bạn.",
    };
  };

  const verifyRegisterOtp = async (email: string, otp: string) => {
    const result = await authApi.verifyRegisterOtp({ email, otp });
    if (!result.success || !result.data) throw new Error(result.message);
    return result.data;
  };

  const resendRegisterOtp = async (email: string) => {
    const result = await authApi.resendRegisterOtp({ email });
    if (!result.success) throw new Error(result.message);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    const res = await authApi.getProfile();
    if (res.success && res.data) {
      setUser(res.data);
    }
  };

  const hasPermission = (code: PermissionCode): boolean => {
    if (!user) {
      const allowed = PERMISSIONS[code] as readonly string[];
      return allowed.includes("GUEST");
    }
    const allowed = PERMISSIONS[code] as readonly string[];
    const role = user.role as UserRole;
    return allowed.includes(role);
  };

  const updateUser = (u: User) => {
    setUser(u);
    localStorage.setItem("moctram_user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyMfa,
        register,
        verifyRegisterOtp,
        resendRegisterOtp,
        logout,
        hasPermission,
        updateUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
