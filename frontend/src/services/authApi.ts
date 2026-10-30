import type { ApiResult, User, UserRole } from "@/types";
import { apiClient, tokenStorage } from "./apiClient";

interface BackendUserPayload {
  id?: string | number;
  email?: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  role?: string;
  status?: string;
  isActive?: boolean;
  addresses?: Array<{
    id?: string | number;
    full_name?: string;
    fullName?: string;
    phone?: string;
    province?: string;
    ward?: string;
    detail?: string;
    street_address?: string;
    is_default?: boolean;
    isDefault?: boolean;
  }>;
  created_at?: string;
  createdAt?: string;
}

export function mapBackendUser(raw?: BackendUserPayload | null): User {
  if (!raw) {
    return {
      id: "",
      email: "",
      fullName: "",
      phone: "",
      role: "CUSTOMER",
      isActive: true,
      addresses: [],
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: String(raw.id || ""),
    email: raw.email || "",
    fullName: raw.full_name || raw.fullName || "",
    phone: raw.phone || "",
    role: (raw.role || "CUSTOMER") as UserRole,
    isActive: raw.status ? raw.status === "ACTIVE" : (raw.isActive ?? true),
    addresses: (raw.addresses || []).map((a) => ({
      id: String(a.id || ""),
      fullName: a.full_name || a.fullName || "",
      phone: a.phone || "",
      province: a.province || "",
      ward: a.ward || "",
      detail: a.detail || a.street_address || "",
      isDefault: Boolean(a.is_default ?? a.isDefault),
    })),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export const authApi = {
  /**
   * Đăng ký tài khoản mới (Backend sẽ gửi mã OTP kích hoạt 8 số về email)
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }): Promise<ApiResult<{ email: string }>> {
    const res = await apiClient.post<{ email: string }>("/auth/register", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
    });

    return res;
  },

  /**
   * Xác thực mã OTP để kích hoạt tài khoản sau khi đăng ký
   */
  async verifyRegisterOtp(data: {
    email: string;
    otp: string;
  }): Promise<ApiResult<User>> {
    const res = await apiClient.post<BackendUserPayload>(
      "/auth/verify-register-otp",
      {
        email: data.email.trim().toLowerCase(),
        otp: data.otp.trim(),
      },
    );

    if (res.success && res.data) {
      return {
        ...res,
        data: mapBackendUser(res.data),
      };
    }
    return {
      ...res,
      data: null,
    };
  },

  /**
   * Gửi lại mã OTP kích hoạt tài khoản
   */
  async resendRegisterOtp(data: { email: string }): Promise<ApiResult<unknown>> {
    return apiClient.post("/auth/resend-register-otp", {
      email: data.email.trim().toLowerCase(),
    });
  },

  /**
   * Đăng nhập với Email/SĐT và Mật khẩu
   */
  async login(data: {
    email: string;
    password: string;
  }): Promise<
    ApiResult<{ user: User; requiresMfa: boolean; tempToken?: string }>
  > {
    const res = await apiClient.post<{
      user: BackendUserPayload;
      tokens: { access_token: string; refresh_token: string };
    }>("/auth/login", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    });

    if (!res.success || !res.data) {
      return {
        success: false,
        data: null,
        message: res.message || "Đăng nhập thất bại",
        errors: res.errors,
      };
    }

    const { user: rawUser, tokens } = res.data;
    if (tokens?.access_token) {
      tokenStorage.setAccessToken(tokens.access_token);
    }
    if (tokens?.refresh_token) {
      tokenStorage.setRefreshToken(tokens.refresh_token);
    }

    const mappedUser = mapBackendUser(rawUser);
    tokenStorage.setStoredUser(mappedUser);

    return {
      success: true,
      data: {
        user: mappedUser,
        requiresMfa: false,
      },
      message: res.message || "Đăng nhập thành công",
    };
  },

  /**
   * Đăng xuất hệ thống
   */
  async logout(): Promise<ApiResult<null>> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // Bỏ qua lỗi mạng khi logout
      }
    }
    tokenStorage.clear();
    return { success: true, data: null, message: "Đã đăng xuất" };
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ Backend
   */
  async getProfile(): Promise<ApiResult<User>> {
    const res = await apiClient.get<BackendUserPayload>("/users/me");
    if (res.success && res.data) {
      const user = mapBackendUser(res.data);
      tokenStorage.setStoredUser(user);
      return { ...res, data: user };
    }
    return {
      ...res,
      data: null,
    };
  },

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateProfile(data: {
    fullName: string;
    phone: string;
  }): Promise<ApiResult<User>> {
    const res = await apiClient.patch<BackendUserPayload>("/users/me", {
      full_name: data.fullName,
      phone: data.phone,
    });
    if (res.success && res.data) {
      const user = mapBackendUser(res.data);
      tokenStorage.setStoredUser(user);
      return { ...res, data: user };
    }
    return {
      ...res,
      data: null,
    };
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResult<null>> {
    return apiClient.patch("/auth/change-password", {
      old_password: data.currentPassword,
      new_password: data.newPassword,
    });
  },

  /**
   * Quên mật khẩu - gửi OTP về email
   */
  async forgotPassword(data: { email: string }): Promise<ApiResult<null>> {
    return apiClient.post("/auth/forgot-password", {
      email: data.email.trim().toLowerCase(),
    });
  },

  /**
   * Xác thực mã OTP quên mật khẩu
   */
  async verifyOtp(data: {
    email: string;
    otp: string;
  }): Promise<ApiResult<null>> {
    return apiClient.post("/auth/verify-otp", {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.trim(),
    });
  },

  /**
   * Đặt lại mật khẩu mới sau khi xác thực OTP
   */
  async resetPassword(data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<ApiResult<null>> {
    return apiClient.post("/auth/reset-password", {
      email: data.email.trim().toLowerCase(),
      otp: data.otp.trim(),
      new_password: data.newPassword,
    });
  },

  /**
   * Thêm địa chỉ nhận hàng
   */
  async addAddress(data: {
    fullName: string;
    phone: string;
    province: string;
    ward: string;
    detail: string;
  }): Promise<ApiResult<unknown>> {
    return apiClient.post("/addresses/me", {
      full_name: data.fullName,
      phone: data.phone,
      province: data.province,
      ward: data.ward,
      street_address: data.detail,
    });
  },

  getToken: () => tokenStorage.getAccessToken(),
  getStoredUser: <T>() => tokenStorage.getStoredUser<T>(),
};
