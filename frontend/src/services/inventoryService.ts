import { apiRequest } from './api';

export interface ImportDetail {
    maSach: number;
    soLuongNhap: number;
    giaNhap: number;
}

export interface ImportRequest {
    maNV: number;
    chiTietNhap: ImportDetail[];
}

export interface StockUpdateRequest {
    maSach: number; // Changed from string to number to match backend
    soLuongTon: number;
}

export const inventoryService = {
    importGoods: async (data: ImportRequest) => {
        return await apiRequest('/inventory/import', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateStock: async (data: StockUpdateRequest) => {
        return await apiRequest('/inventory/update-stock', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
};
