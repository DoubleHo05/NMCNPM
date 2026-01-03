import axiosInstance from './axiosInstance';
import { WarehouseItem, WarehouseImport } from '../store/slices/warehouseSlice';

export const warehouseApi = {
  // Warehouse Items
  getItems: async () => {
    const response = await axiosInstance.get('/warehouse/items');
    return response.data;
  },

  getItemById: async (id: string) => {
    const response = await axiosInstance.get(`/warehouse/items/${id}`);
    return response.data;
  },

  updateItem: async (id: string, itemData: Partial<WarehouseItem>) => {
    const response = await axiosInstance.put(`/warehouse/items/${id}`, itemData);
    return response.data;
  },

  // Warehouse Imports
  getImports: async () => {
    const response = await axiosInstance.get('/warehouse/imports');
    return response.data;
  },

  getImportById: async (id: string) => {
    const response = await axiosInstance.get(`/warehouse/imports/${id}`);
    return response.data;
  },

  createImport: async (importData: Partial<WarehouseImport>) => {
    const response = await axiosInstance.post('/warehouse/imports', importData);
    return response.data;
  },

  updateImport: async (id: string, importData: Partial<WarehouseImport>) => {
    const response = await axiosInstance.put(`/warehouse/imports/${id}`, importData);
    return response.data;
  },

  deleteImport: async (id: string) => {
    const response = await axiosInstance.delete(`/warehouse/imports/${id}`);
    return response.data;
  },

  getWarehouseStats: async () => {
    const response = await axiosInstance.get('/warehouse/stats');
    return response.data;
  },
};
