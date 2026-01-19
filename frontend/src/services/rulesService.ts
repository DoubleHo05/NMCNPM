import { apiRequest } from './api';
import { SystemRules } from '../types';

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Lấy tất cả quy định từ database
export const getAllRules = async (): Promise<SystemRules> => {
  try {
    const response = await apiRequest<ApiResponse<SystemRules>>('/rules');
    return response.data;
  } catch (error) {
    console.error('Error fetching rules:', error);
    // Return default values if API fails
    return {
      minImportQuantity: 150,
      maxStockBeforeImport: 300,
      maxCustomerDebt: 20000,
      minStockAfterSale: 20,
      usePaymentRule: true,
    };
  }
};

// Cập nhật quy định
export const updateRulesApi = async (rules: Partial<SystemRules>): Promise<SystemRules> => {
  const response = await apiRequest<ApiResponse<SystemRules>>('/rules', {
    method: 'PUT',
    body: JSON.stringify(rules),
  });
  return response.data;
};
