import type { ApiResult } from "@/types";

const ACCESS_TOKEN_KEY = "moctram_access_token";
const REFRESH_TOKEN_KEY = "moctram_refresh_token";
const USER_KEY = "moctram_user";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string | null) {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string | null) {
    if (token) localStorage.setItem(REFRESH_TOKEN_KEY, token);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  getStoredUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  setStoredUser(user: unknown | null) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

interface RequestOptions extends Omit<RequestInit, "body"> {
  skipAuth?: boolean;
  body?: unknown;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const json = (await res.json()) as {
      success?: boolean;
      data?: { access_token?: string; refresh_token?: string };
    };

    if (res.ok && json.success && json.data?.access_token) {
      const newAccessToken = json.data.access_token;
      const newRefreshToken = json.data.refresh_token || refreshToken;
      tokenStorage.setAccessToken(newAccessToken);
      tokenStorage.setRefreshToken(newRefreshToken);
      return newAccessToken;
    }
  } catch {
    // Refresh failed
  }

  tokenStorage.clear();
  return null;
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResult<T>> {
  const { skipAuth = false, headers = {}, body, ...rest } = options;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  const token = tokenStorage.getAccessToken();
  if (!skipAuth && token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  try {
    let response = await fetch(url, config);

    // Xử lý 401 (Token hết hạn) -> Tự động refresh token
    if (
      response.status === 401 &&
      !skipAuth &&
      !endpoint.includes("/auth/refresh-token") &&
      !endpoint.includes("/auth/login")
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);

        if (newToken) {
          requestHeaders["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(url, { ...config, headers: requestHeaders });
        }
      } else {
        // Đợi request refresh token đang chạy
        const retryToken = await new Promise<string | null>((resolve) => {
          subscribeTokenRefresh(resolve);
        });
        if (retryToken) {
          requestHeaders["Authorization"] = `Bearer ${retryToken}`;
          response = await fetch(url, { ...config, headers: requestHeaders });
        }
      }
    }

    const contentType = response.headers.get("content-type");
    let json: Record<string, unknown> | null = null;
    if (contentType && contentType.includes("application/json")) {
      json = (await response.json()) as Record<string, unknown>;
    }

    if (!response.ok) {
      let message =
        typeof json?.message === "string" ? json.message : undefined;
      if (!message && json?.detail) {
        if (Array.isArray(json.detail)) {
          message = json.detail
            .map((d: unknown) => {
              if (typeof d === "object" && d !== null && "msg" in d) {
                return String((d as { msg: unknown }).msg);
              }
              return String(d);
            })
            .join(", ");
        } else {
          message = String(json.detail);
        }
      }
      if (!message) {
        message = `Yêu cầu thất bại (${response.status})`;
      }
      return {
        success: false,
        data: null,
        message,
        errors: (json?.errors as Record<string, string>) || undefined,
      };
    }

    return {
      success: true,
      data: (json?.data !== undefined ? json.data : json) as T,
      message: typeof json?.message === "string" ? json.message : "Thành công",
    };
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Không thể kết nối đến máy chủ";
    return {
      success: false,
      data: null,
      message: errorMsg.includes("Failed to fetch")
        ? "Không thể kết nối máy chủ backend. Vui lòng kiểm tra backend đã chạy chưa (port 8000)."
        : errorMsg,
    };
  }
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, { ...options, method: "GET" });
  },
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return request<T>(endpoint, { ...options, method: "POST", body });
  },
  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return request<T>(endpoint, { ...options, method: "PUT", body });
  },
  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return request<T>(endpoint, { ...options, method: "PATCH", body });
  },
  delete<T>(endpoint: string, options?: RequestOptions) {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
