import { apiRequest } from './api';

export interface Setting {
    maQuyDinh: number;
    tenQuyDinh: string;
    giaTri: string;
    moTa?: string;
    ngayCapNhat?: string;
}

export interface SettingUpdate {
    giaTri: string;
}

export const settingService = {
    getAllSettings: async () => {
        return await apiRequest<{ data: { settings: Setting[] } }>('/settings'); // Adjust generic type based on actual API response wrapper
    },

    updateSetting: async (id: number, data: SettingUpdate) => {
        return await apiRequest(`/settings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },
};
