import axiosInstance from './axiosInstance';

export interface ImportItem {
  maSach: number;
  tenSach: string;
  soLuong: number;
  donGia: number;
}

export interface ImportReceipt {
  maPhieuNhap?: number;
  ngayNhap: string;
  maNV: number;
  chiTiet: ImportItem[];
}

export interface Book {
  maSach: number;
  tenSach: string;
  tacGia?: string;
  theLoai?: string;
  soLuongTon: number;
  donGia: number;
}

export const warehouseApi = {
  // Lấy danh sách phiếu nhập
  getImportReceipts: async (params?: { page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/warehouse', { params });
    return response.data;
  },

  // Lấy chi tiết phiếu nhập
  getImportReceiptById: async (id: number) => {
    const response = await axiosInstance.get(`/warehouse/${id}`);
    return response.data;
  },

  // Tạo phiếu nhập mới
  createImportReceipt: async (data: ImportReceipt) => {
    const response = await axiosInstance.post('/warehouse', data);
    return response.data;
  },

  // Lấy danh sách sách
  getBooks: async (params?: { search?: string }) => {
    const response = await axiosInstance.get('/books', { params });
    return response.data;
  },

  // Lấy sách theo ID
  getBookById: async (id: number) => {
    const response = await axiosInstance.get(`/books/${id}`);
    return response.data;
  },
};
