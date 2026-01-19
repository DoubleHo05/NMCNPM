import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { usePermissions } from '../hooks/usePermissions';
import { DollarSign, AlertCircle, CheckCircle, User, MapPin, Phone, Save, History, Plus, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/DatePicker';

const CashCollectionHistoryView: React.FC = () => {
  const { paymentHistory, getCustomer } = useStore();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD

  const filteredHistory = paymentHistory.filter(receipt => receipt.date.startsWith(filterDate));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-72">
          <DatePicker
            value={filterDate}
            onChange={setFilterDate}
            label="Xem lịch sử theo ngày"
          />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
        {filteredHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map(receipt => {
              const customer = getCustomer(receipt.customerId);
              return (
                <div key={receipt.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{receipt.id}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(receipt.date).toLocaleString('vi-VN')} • KH: {customer?.name || receipt.customerName || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-purple-700">{receipt.amount.toLocaleString()}đ</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <History size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-700">Không có lịch sử thu tiền</h3>
            <p className="text-sm">Chưa có phiếu thu nào được tạo trong ngày này.</p>
          </div>
        )}
      </div>
    </div>
  );
};


const CashCollection: React.FC = () => {
  const { customers, collectMoney, rules, addNotification, getCustomer, refreshCustomers } = useStore();
  const { canCollectPayment, userRole } = usePermissions();

  // [NEW] Refresh data on mount to ensure latest debt is shown
  React.useEffect(() => {
    refreshCustomers();
  }, []);

  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Show access denied if user doesn't have permission
  if (!canCollectPayment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-600 mb-4">
            Bạn không có quyền thu tiền. Chức năng này chỉ dành cho <strong>Thu ngân</strong> và <strong>Quản lý</strong>.
          </p>
          <p className="text-sm text-slate-500">
            Vai trò của bạn: <span className="font-semibold">{userRole === 'THU_KHO' ? 'Thủ kho' : userRole}</span>
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

  const selectedCustomer = customers.find(c => c.id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!customerId) {
      setError('Vui lòng chọn khách hàng để điền thông tin vào phiếu.');
      return;
    }
    if (amount <= 0) {
      setError('Số tiền thu phải lớn hơn 0.');
      return;
    }

    const result = await collectMoney(customerId, amount);
    if (result.success) {
      setSuccess(result.message);

      const customerName = getCustomer(customerId)?.name || "Không rõ";
      addNotification({
        type: 'payment',
        title: 'Ghi nhận thanh toán',
        message: `Đã thu ${amount.toLocaleString()}đ từ khách hàng ${customerName}.`
      });

      setAmount(0);
      setCustomerId('');
      setTimeout(() => setActiveTab('history'), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Thu Tiền (BM4)</h2>
          <div className="text-sm text-slate-500 mt-1">
            Dashboard <span className="mx-2">›</span> Thu tiền
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-slate-200 flex">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
             ${activeTab === 'create'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <Plus size={16} /> Lập phiếu thu
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
             ${activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <History size={16} /> Lịch sử thu tiền
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative animate-in fade-in duration-300">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 rounded-t-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="text-blue-600" size={20} />
                Thông tin phiếu thu
              </h3>
              <p className="text-sm text-slate-500 mt-1">Điền đầy đủ thông tin khách hàng và số tiền cần thu.</p>
            </div>

            <div className="w-full md:w-72">
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Chọn khách hàng</label>
              <div className="relative z-10">
                <select
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- Tìm khách hàng --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - Nợ: {c.currentDebt.toLocaleString()}đ
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {/* Hiển thị quy định QĐ4 */}
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-center gap-2">
              <AlertCircle size={16} />
              <span><strong>Quy định (QĐ4):</strong> {rules.usePaymentRule ? 'Số tiền thu KHÔNG được vượt quá số tiền nợ của khách hàng.' : 'Cho phép thu vượt số tiền nợ.'}</span>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              <div className="relative group z-0">
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ tên khách hàng</label>
                <div className="flex items-center w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <User size={18} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-transparent outline-none text-slate-900 font-medium cursor-not-allowed"
                    value={selectedCustomer?.name || ''}
                    placeholder="Tự động điền khi chọn khách hàng"
                  />
                </div>
              </div>

              <div className="relative group z-0">
                <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ</label>
                <div className="flex items-center w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <MapPin size={18} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-transparent outline-none text-slate-900 font-medium cursor-not-allowed"
                    value={selectedCustomer?.address || ''}
                    placeholder="..."
                  />
                </div>
              </div>

              <div className="relative group z-0">
                <label className="block text-sm font-medium text-slate-700 mb-1">Điện thoại</label>
                <div className="flex items-center w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Phone size={18} className="text-slate-400 mr-3" />
                  <input
                    type="text"
                    readOnly
                    className="w-full bg-transparent outline-none text-slate-900 font-medium cursor-not-allowed"
                    value={selectedCustomer?.phone || ''}
                    placeholder="..."
                  />
                </div>
              </div>

              <div className="relative group z-0">
                <label className="block text-sm font-medium text-slate-700 mb-1">Số tiền thu</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full p-2.5 pl-4 pr-12 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                    value={amount === 0 ? '' : amount.toLocaleString('vi-VN')}
                    onChange={(e) => {
                      // Remove non-digit characters
                      const val = e.target.value.replace(/\D/g, '');
                      setAmount(val === '' ? 0 : parseInt(val, 10));
                    }}
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-2.5 text-slate-500 font-medium text-sm">VNĐ</span>
                </div>
                {selectedCustomer && (
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-slate-500">Nợ hiện tại: <span className="font-semibold text-slate-900">{selectedCustomer.currentDebt.toLocaleString()} đ</span></span>
                    {rules.usePaymentRule && amount > selectedCustomer.currentDebt && (
                      <span className="text-red-500 font-medium flex items-center gap-1">
                        <AlertCircle size={12} /> Vi phạm QĐ4: Thu quá số tiền nợ
                      </span>
                    )}
                  </div>
                )}
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
              >
                <Save size={18} />
                Lập phiếu thu
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in duration-300">
          <CashCollectionHistoryView />
        </div>
      )}
    </div>
  );
};

export default CashCollection;
