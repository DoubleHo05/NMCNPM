import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { usePermissions } from '../hooks/usePermissions';
import { Save, Settings as SettingsIcon, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { SystemRules } from '../types';

const Settings: React.FC = () => {
  const { rules, updateRules, addNotification } = useStore();
  const { canEditSettings, userRole } = usePermissions();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SystemRules>(rules);
  const [saved, setSaved] = useState(false);

  // Show access denied if user doesn't have permission
  if (!canEditSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-600 mb-4">
            Bạn không có quyền chỉnh sửa quy định hệ thống. Chức năng này chỉ dành cho <strong>Quản lý</strong>.
          </p>
          <p className="text-sm text-slate-500">
            Vai trò của bạn: <span className="font-semibold">{userRole === 'THU_KHO' ? 'Thủ kho' : userRole === 'THU_NGAN' ? 'Thu ngân' : userRole}</span>
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof SystemRules, value: any) => {
    setFormData({ ...formData, [field]: value });
    setSaved(false);
  };

  const handleSave = () => {
    // Detect changes to report in notification
    const changes = [];
    if (rules.minImportQuantity !== formData.minImportQuantity) changes.push("SL nhập tối thiểu");
    if (rules.maxStockBeforeImport !== formData.maxStockBeforeImport) changes.push("Tồn tối đa trước nhập");
    if (rules.maxCustomerDebt !== formData.maxCustomerDebt) changes.push("Nợ tối đa");
    if (rules.minStockAfterSale !== formData.minStockAfterSale) changes.push("Tồn tối thiểu sau bán");
    if (rules.usePaymentRule !== formData.usePaymentRule) changes.push("QĐ thu tiền");

    updateRules(formData);

    if (changes.length > 0) {
      addNotification({
        type: 'settings',
        title: 'Quy định hệ thống đã thay đổi',
        message: `Các quy định sau đã được cập nhật: ${changes.join(', ')}.`
      });
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <SettingsIcon size={24} className="text-slate-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Thay đổi quy định (QĐ6)</h2>
            <p className="text-sm text-slate-500">Cấu hình các tham số nghiệp vụ của hệ thống.</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Section QĐ1 */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">Quy định 1: Nhập sách</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng nhập tối thiểu</label>
                <input
                  type="number"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.minImportQuantity}
                  onChange={(e) => handleChange('minImportQuantity', parseInt(e.target.value))}
                />
                <p className="text-xs text-slate-400 mt-1">Mặc định: 150</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lượng tồn tối đa trước khi nhập</label>
                <input
                  type="number"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.maxStockBeforeImport}
                  onChange={(e) => handleChange('maxStockBeforeImport', parseInt(e.target.value))}
                />
                <p className="text-xs text-slate-400 mt-1">Mặc định: 300</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* Section QĐ2 */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">Quy định 2: Bán sách</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tiền nợ tối đa (VNĐ)</label>
                <input
                  type="number"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.maxCustomerDebt}
                  onChange={(e) => handleChange('maxCustomerDebt', parseInt(e.target.value))}
                />
                <p className="text-xs text-slate-400 mt-1">Mặc định: 20,000</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lượng tồn tối thiểu sau bán</label>
                <input
                  type="number"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.minStockAfterSale}
                  onChange={(e) => handleChange('minStockAfterSale', parseInt(e.target.value))}
                />
                <p className="text-xs text-slate-400 mt-1">Mặc định: 20</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full"></div>

          {/* Section QĐ4 */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">Quy định 4: Thu tiền</h3>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="usePaymentRule"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.usePaymentRule}
                onChange={(e) => handleChange('usePaymentRule', e.target.checked)}
              />
              <label htmlFor="usePaymentRule" className="text-sm text-slate-700">
                Áp dụng quy định: Số tiền thu không vượt quá số tiền nợ
              </label>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {saved ? (
            <span className="text-green-600 text-sm font-medium animate-pulse">Đã lưu thay đổi thành công!</span>
          ) : <span></span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Save size={18} />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;