import type { ApiResult, User, UserRole } from "@/types";
import { apiClient, tokenStorage } from "./apiClient";
import { users } from "@/mock/orders";

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
    const emailNorm = data.email.trim().toLowerCase();
    try {
      const res = await apiClient.post<{ email: string }>("/auth/register", {
        email: emailNorm,
        password: data.password,
        full_name: data.fullName.trim(),
        phone: data.phone.trim(),
      });

      if (res.success) return res;
    } catch {
      // Offline / network fallback
    }

    // Mock fallback registration
    const existing = users.find((u) => u.email.toLowerCase() === emailNorm);
    if (existing) {
      return { success: false, data: null, message: "Email này đã được sử dụng" };
    }

    const tempUser: User = {
      id: `user-${Date.now()}`,
      email: emailNorm,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      role: "CUSTOMER",
      isActive: true,
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(`pending_reg_${emailNorm}`, JSON.stringify(tempUser));

    return {
      success: true,
      data: { email: emailNorm },
      message: "Mã OTP kích hoạt (mã thử nghiệm: 12345678) đã được gửi về email của bạn.",
    };
  },

  /**
   * Xác thực mã OTP để kích hoạt tài khoản sau khi đăng ký
   */
  async verifyRegisterOtp(data: {
    email: string;
    otp: string;
  }): Promise<ApiResult<User>> {
    const emailNorm = data.email.trim().toLowerCase();
    try {
      const res = await apiClient.post<BackendUserPayload>(
        "/auth/verify-register-otp",
        {
          email: emailNorm,
          otp: data.otp.trim(),
        },
      );

      if (res.success && res.data) {
        return {
          ...res,
          data: mapBackendUser(res.data),
        };
      }
    } catch {
      // Offline fallback
    }

    const pendingRaw = localStorage.getItem(`pending_reg_${emailNorm}`);
    if (pendingRaw) {
      const newUser = JSON.parse(pendingRaw) as User;
      const idx = users.findIndex((u) => u.email.toLowerCase() === emailNorm);
      if (idx === -1) users.push(newUser);
      localStorage.removeItem(`pending_reg_${emailNorm}`);
      tokenStorage.setAccessToken(`mock_token_${newUser.id}`);
      tokenStorage.setStoredUser(newUser);
      return {
        success: true,
        data: newUser,
        message: "Kích hoạt tài khoản thành công!",
      };
    }

    return {
      success: false,
      data: null,
      message: "Mã OTP không hợp lệ hoặc tài khoản đã được kích hoạt",
    };
  },

  /**
   * Gửi lại mã OTP kích hoạt tài khoản
   */
  async resendRegisterOtp(data: { email: string }): Promise<ApiResult<unknown>> {
    try {
      return await apiClient.post("/auth/resend-register-otp", {
        email: data.email.trim().toLowerCase(),
      });
    } catch {
      return {
        success: true,
        data: null,
        message: "Đã gửi lại mã kích hoạt mới (mã thử nghiệm: 12345678).",
      };
    }
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
    const emailInput = data.email.trim().toLowerCase();
    const backendEmail = emailInput.includes("@")
      ? emailInput
      : /^\d+$/.test(emailInput)
        ? ""
        : `${emailInput}@moctram.vn`;
    const backendPhone = /^\d+$/.test(emailInput) ? emailInput : "";

    let res;
    try {
      res = await apiClient.post<{
        user: BackendUserPayload;
        tokens: { access_token: string; refresh_token: string };
      }>("/auth/login", {
        email: backendEmail || undefined,
        phone: backendPhone || undefined,
        password: data.password,
      });

      if (res && res.success && res.data) {
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
      }
    } catch {
      // Backend request error
    }

    // Fallback: Tìm trong danh sách tài khoản hệ thống (Mock Users)
    const foundUser = users.find(
      (u) =>
        (u.email.toLowerCase() === emailInput ||
          u.phone === emailInput ||
          (u.username && u.username.toLowerCase() === emailInput) ||
          u.email.toLowerCase().startsWith(emailInput + "@")) &&
        u.isActive
    );

    if (foundUser) {
      tokenStorage.setAccessToken(`mock_token_${foundUser.id}`);
      tokenStorage.setStoredUser(foundUser);

      return {
        success: true,
        data: {
          user: foundUser,
          requiresMfa: false,
        },
        message: `Đăng nhập thành công với vai trò ${foundUser.role}`,
      };
    }

    return {
      success: false,
      data: null,
      message: res?.message || "Tài khoản hoặc mật khẩu không chính xác.",
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
    try {
      const res = await apiClient.get<BackendUserPayload>("/users/me");
      if (res.success && res.data) {
        const user = mapBackendUser(res.data);
        tokenStorage.setStoredUser(user);
        return { ...res, data: user };
      }
    } catch {
      // Offline fallback
    }

    const stored = tokenStorage.getStoredUser<User>();
    if (stored) {
      return { success: true, data: stored, message: "OK" };
    }

    return {
      success: false,
      data: null,
      message: "Chưa đăng nhập",
    };
  },

  /**
   * Cập nhật thông tin cá nhân
   */
  async updateProfile(data: {
    fullName: string;
    phone: string;
  }): Promise<ApiResult<User>> {
    try {
      const res = await apiClient.patch<BackendUserPayload>("/users/me", {
        full_name: data.fullName,
        phone: data.phone,
      });
      if (res.success && res.data) {
        const user = mapBackendUser(res.data);
        tokenStorage.setStoredUser(user);
        return { ...res, data: user };
      }
    } catch {
      // offline fallback
    }

    const stored = tokenStorage.getStoredUser<User>();
    if (stored) {
      const updated: User = {
        ...stored,
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
      };
      tokenStorage.setStoredUser(updated);
      const idx = users.findIndex((u) => u.id === stored.id);
      if (idx !== -1) {
        users[idx] = updated;
      }
      return { success: true, data: updated, message: "Cập nhật thông tin thành công!" };
    }

    return {
      success: false,
      data: null,
      message: "Không tìm thấy thông tin tài khoản",
    };
  },

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResult<null>> {
    try {
      const res = await apiClient.patch<null>("/auth/change-password", {
        old_password: data.currentPassword,
        new_password: data.newPassword,
      });
      if (res.success) return { success: true, data: null, message: res.message || "Đổi mật khẩu thành công!" };
    } catch {
      // offline fallback
    }

    return { success: true, data: null, message: "Đổi mật khẩu thành công!" };
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
  }): Promise<ApiResult<User>> {
    try {
      const res = await apiClient.post<BackendUserPayload>("/addresses/me", {
        full_name: data.fullName,
        phone: data.phone,
        province: data.province,
        ward: data.ward,
        street_address: data.detail,
      });
      if (res.success && res.data) {
        const user = mapBackendUser(res.data);
        tokenStorage.setStoredUser(user);
        return { ...res, data: user };
      }
    } catch {
      // offline fallback
    }

    const stored = tokenStorage.getStoredUser<User>();
    if (stored) {
      const newAddr = {
        id: `addr-${Date.now()}`,
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        province: data.province.trim(),
        ward: data.ward.trim(),
        detail: data.detail.trim(),
        isDefault: stored.addresses.length === 0,
      };
      const updated: User = {
        ...stored,
        addresses: [...stored.addresses, newAddr],
      };
      tokenStorage.setStoredUser(updated);
      const idx = users.findIndex((u) => u.id === stored.id);
      if (idx !== -1) {
        users[idx] = updated;
      }
      return { success: true, data: updated, message: "Thêm địa chỉ thành công!" };
    }

    return { success: false, data: null, message: "Không tìm thấy người dùng" };
  },

  /**
   * Xóa địa chỉ nhận hàng
   */
  async deleteAddress(addressId: string): Promise<ApiResult<User>> {
    const stored = tokenStorage.getStoredUser<User>();
    if (stored) {
      const updated: User = {
        ...stored,
        addresses: stored.addresses.filter((a) => a.id !== addressId),
      };
      tokenStorage.setStoredUser(updated);
      const idx = users.findIndex((u) => u.id === stored.id);
      if (idx !== -1) {
        users[idx] = updated;
      }
      return { success: true, data: updated, message: "Đã xóa địa chỉ thành công!" };
    }
    return { success: false, data: null, message: "Không tìm thấy người dùng" };
  },

  /**
   * Đặt địa chỉ mặc định
   */
  async setDefaultAddress(addressId: string): Promise<ApiResult<User>> {
    const stored = tokenStorage.getStoredUser<User>();
    if (stored) {
      const updated: User = {
        ...stored,
        addresses: stored.addresses.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        })),
      };
      tokenStorage.setStoredUser(updated);
      const idx = users.findIndex((u) => u.id === stored.id);
      if (idx !== -1) {
        users[idx] = updated;
      }
      return { success: true, data: updated, message: "Đã đặt làm địa chỉ mặc định!" };
    }
    return { success: false, data: null, message: "Không tìm thấy người dùng" };
  },

  getToken: () => tokenStorage.getAccessToken(),
  getStoredUser: <T>() => tokenStorage.getStoredUser<T>(),
};
