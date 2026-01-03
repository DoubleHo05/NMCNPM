import axiosInstance from './axiosInstance';
import { Rule } from '../store/slices/rulesSlice';

export const rulesApi = {
  getRules: async () => {
    const response = await axiosInstance.get('/rules');
    return response.data;
  },

  getRuleById: async (id: string) => {
    const response = await axiosInstance.get(`/rules/${id}`);
    return response.data;
  },

  createRule: async (ruleData: Partial<Rule>) => {
    const response = await axiosInstance.post('/rules', ruleData);
    return response.data;
  },

  updateRule: async (id: string, ruleData: Partial<Rule>) => {
    const response = await axiosInstance.put(`/rules/${id}`, ruleData);
    return response.data;
  },

  deleteRule: async (id: string) => {
    const response = await axiosInstance.delete(`/rules/${id}`);
    return response.data;
  },
};
