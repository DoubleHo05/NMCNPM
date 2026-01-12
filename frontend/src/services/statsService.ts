import { apiRequest } from './api';

export interface DashboardStats {
  totalStock: number;
  totalDebt: number;
  totalCustomers: number;
  lowStockBooks: number;
  salesData: { name: string; sales: number }[];
  topBooks: {
    id: string;
    title: string;
    author: string;
    price: number;
    stock: number;
    imageUrl: string;
    totalSold: number;
  }[];
  trends: {
    stock: number;
    debt: number;
    customers: number;
    revenue: number;
  };
}

export interface InventoryReportItem {
  id: string;
  title: string;
  author: string;
  startStock: number;
  change: number;
  endStock: number;
}

export interface DebtReportItem {
  id: string;
  name: string;
  phone: string;
  startDebt: number;
  change: number;
  endDebt: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// Lấy thống kê Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiRequest<ApiResponse<DashboardStats>>('/stats/dashboard');
  return response.data;
};

// Lấy báo cáo tồn kho (BM5.1)
export const getInventoryReport = async (month: number, year: number): Promise<InventoryReportItem[]> => {
  const response = await apiRequest<ApiResponse<InventoryReportItem[]>>(`/stats/inventory?month=${month}&year=${year}`);
  return response.data;
};

// Lấy báo cáo công nợ (BM5.2)
export const getDebtReport = async (month: number, year: number): Promise<DebtReportItem[]> => {
  const response = await apiRequest<ApiResponse<DebtReportItem[]>>(`/stats/debt?month=${month}&year=${year}`);
  return response.data;
};
