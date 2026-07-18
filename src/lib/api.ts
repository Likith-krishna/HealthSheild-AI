import axios from "axios";

// Standard user interface
export interface User {
  id: string;
  fullName: string;
  email: string;
  userId: string;
  phoneNumber: string;
  address: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
  email_verified: boolean;
}

export interface LoginHistoryRecord {
  id: string;
  userId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: "success" | "failed";
}

// Configured axios client targeting the root full-stack Node container
const apiClient = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-add fresh Bearer Authentication JWT token to all outbound requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aegis_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto token refresh interceptor on 401 responses
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Direct token expired scenario
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/refresh") || originalRequest.url?.includes("/auth/login")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("aegis_refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post("/api/auth/refresh", { refreshToken });
        const { accessToken } = response.data;

        localStorage.setItem("aegis_access_token", accessToken);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        // Invalidate session if refresh token has also failed
        localStorage.removeItem("aegis_access_token");
        localStorage.removeItem("aegis_refresh_token");
        window.dispatchEvent(new Event("aegis_logout"));
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  // 1. Register a new user
  async register(payload: any) {
    const response = await apiClient.post("/api/auth/register", payload);
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem("aegis_access_token", accessToken);
    localStorage.setItem("aegis_refresh_token", refreshToken);
    return { user, accessToken };
  },

  // 2. Authenticate existing user
  async login(payload: any, rememberMe: boolean = true) {
    const response = await apiClient.post("/api/auth/login", payload);
    const { accessToken, refreshToken, user } = response.data;
    if (rememberMe) {
      localStorage.setItem("aegis_access_token", accessToken);
      localStorage.setItem("aegis_refresh_token", refreshToken);
    } else {
      sessionStorage.setItem("aegis_access_token", accessToken);
      sessionStorage.setItem("aegis_refresh_token", refreshToken);
      // Also backup to memory
      localStorage.setItem("aegis_access_token", accessToken);
      localStorage.setItem("aegis_refresh_token", refreshToken);
    }
    return { user, accessToken };
  },

  // 3. Close security session
  async logout() {
    try {
      await apiClient.post("/api/auth/logout");
    } catch (e) {
      // Ignored since we clean client keys anyway
    }
    localStorage.removeItem("aegis_access_token");
    localStorage.removeItem("aegis_refresh_token");
    window.dispatchEvent(new Event("aegis_logout"));
  },

  // 4. Retrieve logged-in profile details and history logs
  async getProfile(): Promise<{ user: User; loginHistory: LoginHistoryRecord[] }> {
    const response = await apiClient.get("/api/users/me");
    return response.data;
  },

  // 5. Update demographics
  async updateProfile(payload: { fullName: string; phoneNumber: string; address: string }): Promise<User> {
    const response = await apiClient.put("/api/users/profile", payload);
    return response.data.user;
  },

  // 6. Update secret password
  async changePassword(payload: any) {
    const response = await apiClient.put("/api/users/change-password", payload);
    return response.data;
  },

  // 6b. Self-service reset password for forgotten credentials
  async resetPassword(payload: { identifier: string; newPassword: any }) {
    const response = await apiClient.post("/api/auth/reset-password", payload);
    return response.data;
  },

  // 7. Check if user has active storage keys
  hasToken(): boolean {
    return !!localStorage.getItem("aegis_access_token");
  }
};
 