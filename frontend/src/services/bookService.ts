import { apiRequest } from './api';
import type { Book } from '../types';

export const bookService = {
    getAllBooks: async () => {
        return apiRequest<{ data: any[] }>('/books', { method: 'GET' });
    },

    getBookById: async (id: string | number) => {
        return apiRequest<{ data: Book }>(`/books/${id}`, { method: 'GET' });
    },

    updateBook: async (id: string | number, data: Partial<Book>) => {
        return apiRequest<{ success: boolean; message: string; data?: Book }>(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    deleteBook: async (id: string | number) => {
        return apiRequest<{ success: boolean; message: string }>(`/books/${id}`, { method: 'DELETE' });
    }
};
