import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header nếu có
axiosInstance.interceptors.request.use((config) => {
  // Tạm thời comment để test không cần đăng nhập
  // const token = localStorage.getItem('token');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

export default axiosInstance;
