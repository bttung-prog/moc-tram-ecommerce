import type { ApiResult } from '@/types';

const TOKEN_KEY = 'moctram_token';
const REFRESH_KEY = 'moctram_refresh_token';
const USER_KEY = 'moctram_user';
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

type BackendUser = { id: string; email: string; full_name: string; phone: string; role: string; status: string; created_at?: string };
type BackendEnvelope<T> = { success?: boolean; message?: string; data?: T; error?: unknown[] };
type Tokens = { access_token: string; refresh_token: string };
type LoginPayload = { user: BackendUser; tokens: Tokens };

function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
function setToken(token: string | null) { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); }
function setRefreshToken(token: string | null) { token ? localStorage.setItem(REFRESH_KEY, token) : localStorage.removeItem(REFRESH_KEY); }
function setUser(user: unknown | null) { user ? localStorage.setItem(USER_KEY, JSON.stringify(user)) : localStorage.removeItem(USER_KEY); }
function getStoredUser<T>(): T | null { const raw = localStorage.getItem(USER_KEY); try { return raw ? JSON.parse(raw) as T : null; } catch { return null; } }
function ok<T>(data: T, message = 'Thành công'): ApiResult<T> { return { success: true, data, message }; }
function fail(message: string, errors?: Record<string, string>): ApiResult<never> { return { success: false, data: null, message, errors }; }

function mapUser(user: BackendUser) {
  const roleMap: Record<string, string> = { customer: 'CUSTOMER', admin: 'ADMIN', warehouse_staff: 'STAFF_WAREHOUSE', staff: 'STAFF_CS', staff_cs: 'STAFF_CS', staff_warehouse: 'STAFF_WAREHOUSE' };
  return { id: String(user.id), email: user.email, fullName: user.full_name, phone: user.phone, role: roleMap[String(user.role).toLowerCase()] || String(user.role).toUpperCase(), isActive: String(user.status).toLowerCase() === 'active', addresses: [], createdAt: user.created_at || new Date().toISOString() };
}

async function apiRequest<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<BackendEnvelope<T>> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.auth) {
    const token = getToken();
    if (!token) throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    headers.Authorization = `Bearer ${token}`;
  }
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { method: options.method || (options.body === undefined ? 'GET' : 'POST'), headers, ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }) });
  } catch {
    throw new Error(`Không kết nối được máy chủ (${API_BASE}). Hãy khởi động backend và kiểm tra VITE_API_BASE_URL.`);
  }
  const payload = await response.json().catch(() => ({})) as BackendEnvelope<T>;
  if (!response.ok || payload.success === false) {
    const details = Array.isArray(payload.error) ? payload.error.map((e) => typeof e === 'string' ? e : JSON.stringify(e)).join(', ') : '';
    throw new Error(payload.message || details || `Yêu cầu thất bại (${response.status})`);
  }
  return payload;
}

function saveLogin(payload: LoginPayload) {
  if (!payload?.user || !payload?.tokens?.access_token || !payload?.tokens?.refresh_token) throw new Error('Máy chủ trả về dữ liệu đăng nhập không hợp lệ.');
  const user = mapUser(payload.user);
  setToken(payload.tokens.access_token); setRefreshToken(payload.tokens.refresh_token); setUser(user);
  return user;
}

export const authApi = {
  async register(data: { email: string; password: string; fullName: string; phone: string }): Promise<ApiResult<unknown>> {
    try {
      await apiRequest<BackendUser>('/auth/register', { body: { email: data.email.trim().toLowerCase(), password: data.password, full_name: data.fullName.trim(), phone: data.phone.replace(/\D/g, '') } });
      const login = await apiRequest<LoginPayload>('/auth/login', { body: { email: data.email.trim().toLowerCase(), password: data.password } });
      if (!login.data) throw new Error('Máy chủ không trả về thông tin tài khoản.');
      return ok(saveLogin(login.data), 'Đăng ký và đăng nhập thành công');
    } catch (e) { return fail(e instanceof Error ? e.message : 'Không thể đăng ký tài khoản'); }
  },

  async login(data: { email: string; password: string }): Promise<ApiResult<{ user: unknown; requiresMfa: boolean; tempToken?: string }>> {
    try {
      const result = await apiRequest<LoginPayload>('/auth/login', { body: { email: data.email.trim().toLowerCase(), password: data.password } });
      if (!result.data) throw new Error('Máy chủ không trả về thông tin đăng nhập.');
      // Fail closed: không cấp phiên sử dụng giao diện nhân viê
      const user = mapUser(result.data.user);
const savedUser = saveLogin(result.data);
return ok(
  { user: savedUser, requiresMfa: false },
  result.message || 'Đăng nhập thành công'
);
    } catch (e) { return fail(e instanceof Error ? e.message : 'Email hoặc mật khẩu không đúng'); }
  },

  async verifyMfa(_data: { tempToken: string; otp: string }): Promise<ApiResult<unknown>> {
    return fail('Backend hiện chưa cung cấp endpoint MFA cho đăng nhập quản trị/nhân viên.');
  },

  async forgotPassword(data: { email: string }): Promise<ApiResult<null>> {
    try {
      const result = await apiRequest<unknown>('/auth/forgot-password', { body: { email: data.email.trim().toLowerCase() } });
      return ok(null, result.message || 'Nếu email hợp lệ, mã OTP sẽ được gửi theo cấu hình email của hệ thống.');
    } catch (e) { return fail(e instanceof Error ? e.message : 'Không thể gửi yêu cầu khôi phục mật khẩu'); }
  },

  async resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<ApiResult<null>> {
    try {
      const result = await apiRequest<unknown>('/auth/reset-password', { body: { email: data.email.trim().toLowerCase(), otp: data.otp.trim(), new_password: data.newPassword } });
      return ok(null, result.message || 'Đặt lại mật khẩu thành công');
    } catch (e) { return fail(e instanceof Error ? e.message : 'Không thể đặt lại mật khẩu'); }
  },

  async logout(): Promise<ApiResult<null>> {
    const refresh_token = localStorage.getItem(REFRESH_KEY);
    if (refresh_token) {
      try { await apiRequest('/auth/logout', { body: { refresh_token } }); } catch { /* Clear local session even if backend is offline. */ }
    }
    setToken(null); setRefreshToken(null); setUser(null);
    return ok(null, 'Đã đăng xuất');
  },

  async getProfile(): Promise<ApiResult<unknown>> {
    if (!getToken()) return fail('Chưa đăng nhập');
    try {
      const result = await apiRequest<BackendUser>('/users/me', { auth: true });
      if (!result.data) throw new Error('Máy chủ không trả về hồ sơ người dùng.');
      const user = mapUser(result.data); setUser(user); return ok(user, result.message || 'Đã tải hồ sơ');
    } catch (e) { return fail(e instanceof Error ? e.message : 'Không thể tải hồ sơ'); }
  },

  async updateProfile(data: { fullName: string; phone: string }): Promise<ApiResult<unknown>> {
    try {
      const result = await apiRequest<BackendUser>('/users/me', { method: 'PATCH', auth: true, body: { full_name: data.fullName.trim(), phone: data.phone.replace(/\D/g, '') } });
      const current = getStoredUser<Record<string, unknown>>();
      const user = result.data ? mapUser(result.data) : { ...current, fullName: data.fullName.trim(), phone: data.phone.replace(/\D/g, '') };
      setUser(user); return ok(user, result.message || 'Cập nhật thành công');
    } catch (e) { return fail(e instanceof Error ? e.message : 'Cập nhật hồ sơ thất bại'); }
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResult<null>> {
    try {
      const result = await apiRequest<unknown>('/auth/change-password', { method: 'PATCH', auth: true, body: { old_password: data.currentPassword, new_password: data.newPassword } });
      return ok(null, result.message || 'Đổi mật khẩu thành công');
    } catch (e) { return fail(e instanceof Error ? e.message : 'Đổi mật khẩu thất bại'); }
  },

  async addAddress(_data: { fullName: string; phone: string; province: string; ward: string; detail: string }): Promise<ApiResult<unknown>> {
    return fail('Backend hiện chưa có API lưu sổ địa chỉ. Địa chỉ chưa được lưu để tránh mất dữ liệu khi tải lại.');
  },
  getToken,
  getStoredUser,
};
