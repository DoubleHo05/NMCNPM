import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const customerApi = {
  getCustomers: async () => {
    try {
      const response = await axios.get(`${API_URL}/customers`);
      return response;
    } catch (error) {
      console.error('Get customers error:', error);
      // Return empty data if API not available
      return { data: [] };
    }
  },

  createCustomer: async (data: any) => {
    const response = await axios.post(`${API_URL}/customers`, data);
    return response.data;
  },

  updateCustomer: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/customers/${id}`, data);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response.data;
  },
};
