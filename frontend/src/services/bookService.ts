import { apiRequest } from './api';
import { Book } from '../types';

// Types for API responses
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface Category {
  id: number;
  name: string;
}

interface Publisher {
  id: number;
  name: string;
  address?: string;
  phone?: string;
}

interface Author {
  id: number;
  name: string;
}

// Lấy tất cả sách từ database
export const getAllBooks = async (): Promise<Book[]> => {
  try {
    const response = await apiRequest<ApiResponse<Book[]>>('/books');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Lấy chi tiết một sách
export const getBookById = async (id: string): Promise<Book> => {
  const response = await apiRequest<ApiResponse<Book>>(`/books/${id}`);
  return response.data;
};

// Thêm sách mới
export const createBook = async (bookData: {
  tenSach: string;
  isbn?: string;
  maTheLoai?: number;
  maNXB?: number;
  giaNhap: number;
  giaBanLe: number;
  soLuongTon?: number;
  moTa?: string;
  barcode?: string;
  tacGiaIds?: number[];
}): Promise<Book> => {
  const response = await apiRequest<ApiResponse<Book>>('/books', {
    method: 'POST',
    body: JSON.stringify(bookData),
  });
  return response.data;
};

// Cập nhật sách
export const updateBook = async (
  id: string,
  bookData: {
    tenSach?: string;
    isbn?: string;
    maTheLoai?: number;
    maNXB?: number;
    giaNhap?: number;
    giaBanLe?: number;
    soLuongTon?: number;
    moTa?: string;
    barcode?: string;
    tacGiaIds?: number[];
  }
): Promise<Book> => {
  const response = await apiRequest<ApiResponse<Book>>(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  });
  return response.data;
};

// Xóa sách
export const deleteBookApi = async (id: string): Promise<void> => {
  await apiRequest<ApiResponse<void>>(`/books/${id}`, {
    method: 'DELETE',
  });
};

// Lấy danh sách thể loại
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiRequest<ApiResponse<Category[]>>('/books/categories');
  return response.data || [];
};

// Lấy danh sách nhà xuất bản
export const getPublishers = async (): Promise<Publisher[]> => {
  const response = await apiRequest<ApiResponse<Publisher[]>>('/books/publishers');
  return response.data || [];
};

// Lấy danh sách tác giả
export const getAuthors = async (): Promise<Author[]> => {
  const response = await apiRequest<ApiResponse<Author[]>>('/books/authors');
  return response.data || [];
};
