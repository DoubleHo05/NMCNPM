import { apiRequest, setTokens, clearTokens } from './api';

// Types
export interface User {
  maNV: number;
  tenDangNhap: string;
  hoTen: string;
  email?: string;
  soDienThoai?: string;
  vaiTro: 'QUAN_LY' | 'THU_KHO' | 'THU_NGAN';
  avatar?: string;
  trangThai: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
  };
}

// Login
export const login = async (tenDangNhap: string, matKhau: string): Promise<LoginResponse> => {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ tenDangNhap, matKhau }),
  });

  if (response.success && response.data) {
    setTokens(response.data.accessToken, response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore errors on logout
  } finally {
    clearTokens();
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiRequest<AuthResponse>('/auth/me');
    return response.data.user;
  } catch {
    return null;
  }
};

// Get stored user from localStorage
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};
