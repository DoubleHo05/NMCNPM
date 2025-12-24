import { apiRequest } from './api';
import { User } from './authService';

// User list response
export interface UserListResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface UserResponse {
  success: boolean;
  data: {
    user: User;
  };
  message?: string;
}

// Create user input
export interface CreateUserInput {
  tenDangNhap: string;
  matKhau: string;
  hoTen: string;
  email?: string;
  soDienThoai?: string;
  vaiTro: 'QUAN_LY' | 'THU_KHO' | 'THU_NGAN';
  trangThai?: boolean;
}

// Update user input
export interface UpdateUserInput {
  tenDangNhap?: string;
  matKhau?: string;
  hoTen?: string;
  email?: string;
  soDienThoai?: string;
  vaiTro?: 'QUAN_LY' | 'THU_KHO' | 'THU_NGAN';
  trangThai?: boolean;
}

// Get all users
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  vaiTro?: string;
  trangThai?: string;
}): Promise<UserListResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.append('page', params.page.toString());
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.search) searchParams.append('search', params.search);
  if (params?.vaiTro) searchParams.append('vaiTro', params.vaiTro);
  if (params?.trangThai) searchParams.append('trangThai', params.trangThai);

  const query = searchParams.toString();
  return apiRequest<UserListResponse>(`/users${query ? `?${query}` : ''}`);
};

// Get user by ID
export const getUserById = async (id: number): Promise<UserResponse> => {
  return apiRequest<UserResponse>(`/users/${id}`);
};

// Create user
export const createUser = async (data: CreateUserInput): Promise<UserResponse> => {
  return apiRequest<UserResponse>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Update user
export const updateUser = async (id: number, data: UpdateUserInput): Promise<UserResponse> => {
  return apiRequest<UserResponse>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// Delete user
export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  return apiRequest(`/users/${id}`, { method: 'DELETE' });
};

// Update user status
export const updateUserStatus = async (
  id: number,
  trangThai: boolean
): Promise<UserResponse> => {
  return apiRequest<UserResponse>(`/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ trangThai }),
  });
};
