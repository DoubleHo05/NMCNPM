import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const warehouseApi = {
  getItems: async () => {
    try {
      const response = await axios.get(`${API_URL}/warehouse/items`);
      return response.data;
    } catch (error) {
      console.error('Get warehouse items error:', error);
      // Return empty data if API not available
      return [];
    }
  },

  getWarehouseStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/warehouse/stats`);
      return response.data;
    } catch (error) {
      console.error('Get warehouse stats error:', error);
      // Return default stats if API not available
      return {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
      };
    }
  },

  updateItem: async (id: string, data: any) => {
    const response = await axios.put(`${API_URL}/warehouse/items/${id}`, data);
    return response;
  },

  createImport: async (data: any) => {
    const response = await axios.post(`${API_URL}/warehouse/imports`, data);
    return response;
  },
};
