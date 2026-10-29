import type { ApiResult } from '@/types';
import { randomDelay, generateId, generateOrderCode } from '@/utils/helpers';
import { users } from '@/mock/orders';

const TOKEN_KEY = 'moctram_token';
const USER_KEY = 'moctram_user';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function setUser(user: unknown | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

function getStoredUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) as T : null;
}

function ok<T>(data: T, message = 'Thành công'): ApiResult<T> {
  return { success: true, data, message };
}

function fail(message: string, errors?: Record<string, string>): ApiResult<never> {
  return { success: false, data: null, message, errors };
}

export const authApi = {
  async register(data: { email: string; password: string; fullName: string; phone: string }): Promise<ApiResult<unknown>> {
    await randomDelay();
    const existing = users.find((u) => u.email === data.email);
    if (existing) return fail('Email đã được đăng ký', { email: 'Email này đã có tài khoản' });
    const newUser = {
      id: generateId('user'),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: 'CUSTOMER' as const,
      isActive: true,
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    const token = `mock-jwt-${newUser.id}`;
    setToken(token);
    setUser(newUser);
    return ok(newUser, 'Đăng ký thành công');
  },

  async login(data: { email: string; password: string }): Promise<ApiResult<{ user: unknown; requiresMfa: boolean; tempToken?: string }>> {
    await randomDelay();
    const user = users.find((u) => u.email === data.email);
    if (!user) return fail('Email hoặc mật khẩu không đúng', { email: 'Tài khoản không tồn tại' });
    if (!user.isActive) return fail('Tài khoản đã bị khóa');
    // Customer: direct login. Staff/Admin: requires MFA
    if (user.role === 'STAFF_WAREHOUSE' || user.role === 'STAFF_CS' || user.role === 'ADMIN') {
      const tempToken = `mock-temp-${user.id}`;
      return ok({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, requiresMfa: true, tempToken }, 'Cần xác thực MFA');
    }
    const token = `mock-jwt-${user.id}`;
    setToken(token);
    setUser(user);
    return ok({ user, requiresMfa: false });
  },

  async verifyMfa(data: { tempToken: string; otp: string }): Promise<ApiResult<unknown>> {
    await randomDelay();
    // Accept any 6-digit OTP in mock mode
    if (!/^\d{6}$/.test(data.otp)) return fail('Mã OTP không hợp lệ', { otp: 'Mã OTP phải có 6 chữ số' });
    const userId = data.tempToken.replace('mock-temp-', '');
    const user = users.find((u) => u.id === userId);
    if (!user) return fail('Phiên đăng nhập hết hạn');
    const token = `mock-jwt-${user.id}`;
    setToken(token);
    setUser(user);
    return ok(user, 'Đăng nhập thành công');
  },

  async forgotPassword(data: { email: string }): Promise<ApiResult<null>> {
    await randomDelay();
    const user = users.find((u) => u.email === data.email);
    if (!user) return fail('Email không tồn tại trong hệ thống');
    return ok(null, 'Mã OTP đã được gửi đến email của bạn');
  },

  async resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<ApiResult<null>> {
    await randomDelay();
    if (!/^\d{6}$/.test(data.otp)) return fail('Mã OTP không hợp lệ');
    return ok(null, 'Đặt lại mật khẩu thành công');
  },

  async logout(): Promise<ApiResult<null>> {
    setToken(null);
    setUser(null);
    return ok(null, 'Đã đăng xuất');
  },

  async getProfile(): Promise<ApiResult<unknown>> {
    await randomDelay(100, 300);
    const user = getStoredUser();
    if (!user) return fail('Chưa đăng nhập');
    return ok(user);
  },

  async updateProfile(data: { fullName: string; phone: string }): Promise<ApiResult<unknown>> {
    await randomDelay();
    const user = getStoredUser<{ id: string }>();
    if (!user) return fail('Chưa đăng nhập');
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], fullName: data.fullName, phone: data.phone };
      setUser(users[idx]);
      return ok(users[idx], 'Cập nhật thành công');
    }
    return fail('Không tìm thấy người dùng');
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResult<null>> {
    await randomDelay();
    return ok(null, 'Đổi mật khẩu thành công');
  },

  async addAddress(data: { fullName: string; phone: string; province: string; ward: string; detail: string }): Promise<ApiResult<unknown>> {
    await randomDelay();
    const user = getStoredUser<{ id: string }>();
    if (!user) return fail('Chưa đăng nhập');
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      const addr = { id: generateId('addr'), ...data, isDefault: users[idx].addresses.length === 0 };
      users[idx].addresses.push(addr);
      setUser(users[idx]);
      return ok(addr, 'Thêm địa chỉ thành công');
    }
    return fail('Không tìm thấy người dùng');
  },

  getToken,
  getStoredUser,
};
