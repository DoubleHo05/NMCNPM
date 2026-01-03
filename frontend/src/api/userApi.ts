import axiosInstance from './axiosInstance';
import { User } from '../store/slices/userSlice';

export const userApi = {
  getUsers: async () => {
    const response = await axiosInstance.get('/users');
    // Map backend data to frontend format
    const backendData = response.data;
    if (backendData.data?.users) {
      const roleMap: Record<string, string> = {
        'QUAN_LY': 'admin',
        'THU_NGAN': 'staff',
        'THU_KHO': 'user'
      };
      
      const mappedUsers = backendData.data.users.map((user: any) => ({
        id: String(user.maNV),
        username: user.tenDangNhap || '',
        email: user.email || '',
        role: roleMap[user.vaiTro] || 'user',
        isActive: user.trangThai,
        createdAt: user.createdAt,
      }));
      
      return { data: mappedUsers };
    }
    return { data: [] };
  },

  getUserById: async (id: string) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: any) => {
    // Map frontend role to backend VaiTro enum
    const roleMap: Record<string, string> = {
      'user': 'THU_KHO',
      'staff': 'THU_NGAN',
      'admin': 'QUAN_LY'
    };
    
    // Map frontend fields to backend fields
    const backendData: any = {
      tenDangNhap: userData.username,
      matKhau: userData.password || 'defaultPass123',
      hoTen: userData.fullName,
      vaiTro: roleMap[userData.role] || 'THU_KHO',
      trangThai: userData.isActive !== undefined ? userData.isActive : true,
    };
    
    // Chỉ thêm email và phone nếu có giá trị
    if (userData.email) {
      backendData.email = userData.email;
    }
    if (userData.phone) {
      backendData.soDienThoai = userData.phone;
    }
    
    const response = await axiosInstance.post('/users', backendData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    // Map frontend role to backend VaiTro enum
    const roleMap: Record<string, string> = {
      'user': 'THU_KHO',
      'staff': 'THU_NGAN',
      'admin': 'QUAN_LY'
    };
    
    // Map frontend fields to backend fields
    const backendData = {
      tenDangNhap: userData.username,
      hoTen: userData.fullName,
      email: userData.email || null,
      soDienThoai: userData.phone || null,
      vaiTro: roleMap[userData.role] || 'THU_KHO',
      trangThai: userData.isActive,
    };
    const response = await axiosInstance.put(`/users/${id}`, backendData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await axiosInstance.get('/users/search', {
      params: { q: query },
    });
    return response.data;
  },
};
