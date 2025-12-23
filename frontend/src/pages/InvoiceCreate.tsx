import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Trash2, AlertCircle, Save, User, Minus, Lock, History, FileText, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import { Invoice } from '../types';

interface InvoiceItem {
  bookId: string;
  quantity: number;
}

const InvoiceHistoryView: React.FC = () => {
  const { invoiceHistory, getBook, getCustomer } = useStore();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  const filteredHistory = invoiceHistory.filter(invoice => invoice.date.startsWith(filterDate));

  const toggleExpand = (invoiceId: string) => {
    setExpandedInvoiceId(expandedInvoiceId === invoiceId ? null : invoiceId);
  };

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
            {filteredHistory.map(invoice => {
              const customer = getCustomer(invoice.customerId);
              const isExpanded = expandedInvoiceId === invoice.id;

              return (
                <div key={invoice.id}>
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpand(invoice.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{invoice.id}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(invoice.date).toLocaleString('vi-VN')} • KH: {customer?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-sm font-bold text-green-700">{invoice.totalAmount.toLocaleString()}đ</span>
                       <ChevronDown size={20} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 animate-in fade-in duration-200">
                      <h4 className="font-semibold text-sm text-slate-600 mb-2">Chi tiết hoá đơn:</h4>
                      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
                         <li className="flex items-center justify-between p-3 text-sm bg-slate-50 font-semibold">
                              <span className="text-slate-500 uppercase text-xs w-2/4">Sách</span>
                              <span className="text-slate-500 uppercase text-xs text-center w-1/4">Số lượng</span>
                              <span className="text-slate-500 uppercase text-xs text-right w-1/4">Thành tiền</span>
                         </li>
                        {invoice.items.map((item, index) => {
                          const book = getBook(item.bookId);
                          return (
                            <li key={index} className="flex items-center justify-between p-3 text-sm">
                              <span className="font-medium text-slate-800 w-2/4 truncate">{book?.title || 'Sách không còn tồn tại'}</span>
                              <span className="text-slate-500 text-center w-1/4">{item.quantity}</span>
                              <span className="text-slate-700 font-medium text-right w-1/4">{(item.quantity * item.price).toLocaleString()}đ</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <History size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-700">Không có lịch sử hoá đơn</h3>
            <p className="text-sm">Chưa có hoá đơn nào được tạo trong ngày này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const InvoiceCreate: React.FC = () => {
  const { books, customers, createInvoice, rules, addNotification, getCustomer } = useStore();
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ bookId: '', quantity: 1 }]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  const handleAddItem = () => {
    if (!customerId) return;
    setItems([...items, { bookId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!customerId) {
      setError('Vui lòng chọn khách hàng.');
      return;
    }
    if (items.some(i => !i.bookId || i.quantity <= 0)) {
      setError('Vui lòng chọn sách và nhập số lượng hợp lệ cho tất cả các dòng.');
      return;
    }

    const result = createInvoice(customerId, items);
    if (result.success) {
      const customerName = getCustomer(customerId)?.name || "Không rõ";
      setSuccess(`${result.message} Tổng tiền: ${result.totalAmount.toLocaleString()}đ`);
      
      addNotification({
        type: 'invoice',
        title: 'Hoá đơn mới được tạo',
        message: `Hoá đơn cho KH ${customerName} với tổng giá trị ${result.totalAmount.toLocaleString()}đ.`
      });

      setItems([{ bookId: '', quantity: 1 }]);
      setCustomerId('');
      setTimeout(() => setActiveTab('history'), 1500);
    } else {
      setError(result.message);
    }
  };

  const calculateTotal = () => {
    if (!customerId) return 0;
    return items.reduce((total, item) => {
      const book = books.find(b => b.id === item.bookId);
      return total + (book ? book.price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-xl font-bold text-slate-900">Quản lý Bán Hàng (BM2)</h2>
            <div className="text-sm text-slate-500 mt-1">
                Dashboard <span className="mx-2">›</span> Bán sách
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
           <Plus size={16} /> Lập hoá đơn
         </button>
         <button 
           onClick={() => setActiveTab('history')}
           className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
             ${activeTab === 'history' 
               ? 'border-blue-600 text-blue-600' 
               : 'border-transparent text-slate-500 hover:text-slate-700'}`}
         >
           <History size={16} /> Lịch sử hoá đơn
         </button>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
            </div>
            )}
            
            {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                <Save size={20} />
                <span className="text-sm font-medium">{success}</span>
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:w-1/2">
                    <div className="relative group">
                        <label className="absolute -top-2.5 left-3 bg-[#f8fafc] px-1 text-xs font-medium text-slate-500 group-focus-within:text-blue-600 transition-colors">
                            Họ và tên khách hàng
                        </label>
                        <div className="flex items-center w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm hover:border-slate-400">
                            <User size={18} className={`mr-3 ${!customerId ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                            <select
                                className="w-full bg-transparent outline-none text-slate-900 text-sm font-medium appearance-none cursor-pointer"
                                value={customerId}
                                onChange={(e) => { setCustomerId(e.target.value); if (e.target.value) setError(null); }}
                                autoFocus
                            >
                                <option value="">Chọn khách hàng...</option>
                                {customers.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {c.currentDebt > 0 ? `(Nợ: ${c.currentDebt.toLocaleString()}đ)` : ''}
                                </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                    <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-700">
                        <AlertCircle size={14} />
                        <span>Quy định (QĐ2): Nợ khách tối đa <b>{rules.maxCustomerDebt.toLocaleString()}đ</b>. Tồn kho sau bán tối thiểu <b>{rules.minStockAfterSale}</b>.</span>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4 w-16 text-center">STT</th>
                                    <th className="px-6 py-4 min-w-[300px]">Sách</th>
                                    <th className="px-6 py-4">Thể loại</th>
                                    <th className="px-6 py-4">Tác giả</th>
                                    <th className="px-6 py-4 w-48 text-center">Số lượng</th>
                                    <th className="px-6 py-4 text-right">Đơn giá</th>
                                    <th className="px-6 py-4 text-right">Thành tiền</th>
                                    <th className="px-6 py-4 w-16 text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {!customerId ? (
                                    <tr>
                                        <td colSpan={8} className="py-20 text-center bg-slate-50/50">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                                    <Lock size={32} className="text-slate-300" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-slate-600 mb-1">Chưa chọn khách hàng</h3>
                                                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                                    Vui lòng chọn khách hàng ở mục trên để bắt đầu thêm sách vào hoá đơn.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => {
                                        const book = books.find(b => b.id === item.bookId);
                                        return (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-center text-slate-500 text-sm">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <select
                                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                            value={item.bookId}
                                                            onChange={(e) => handleItemChange(index, 'bookId', e.target.value)}
                                                        >
                                                            <option value="">Chọn sách...</option>
                                                            {books.map(b => (
                                                                <option key={b.id} value={b.id}>
                                                                    {b.title} (Tồn: {b.stock})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{book?.category || '-'}</td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">{book?.author || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center border border-slate-300 rounded-lg overflow-hidden w-40 mx-auto bg-white shadow-sm">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleItemChange(index, 'quantity', Math.max(1, (item.quantity || 0) - 1))}
                                                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border-r border-slate-300 text-slate-600 transition-colors active:bg-slate-200 h-10 w-10 flex items-center justify-center"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            className="w-full p-2 text-center bg-white text-base focus:outline-none font-bold text-slate-900 h-10"
                                                            value={item.quantity === 0 ? '' : item.quantity}
                                                            min="1"
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                handleItemChange(index, 'quantity', val === '' ? 0 : parseInt(val));
                                                            }}
                                                        />
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleItemChange(index, 'quantity', (item.quantity || 0) + 1)}
                                                            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border-l border-slate-300 text-slate-600 transition-colors active:bg-slate-200 h-10 w-10 flex items-center justify-center"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-600 text-sm font-medium">
                                                    {book ? book.price.toLocaleString() : '0'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-blue-600 text-sm font-bold">
                                                    {book ? (book.price * item.quantity).toLocaleString() : '0'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(index)}
                                                        className={`p-2 rounded-lg transition-colors ${items.length > 1 ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-200 cursor-not-allowed'}`}
                                                        disabled={items.length <= 1}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <button
                            type="button"
                            onClick={handleAddItem}
                            disabled={!customerId}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium text-sm transition-colors shadow-sm 
                                ${!customerId 
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                                    : 'text-blue-600 bg-white border-blue-100 hover:bg-blue-50'
                                }`}
                        >
                            <Plus size={16} />
                            Thêm dòng sách
                        </button>

                        <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                            <div className={`text-right ${!customerId ? 'opacity-50' : ''}`}>
                                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tổng thanh toán</p>
                                <p className="text-2xl font-bold text-slate-900">{calculateTotal().toLocaleString()} đ</p>
                            </div>
                            <button
                                type="submit"
                                disabled={!customerId}
                                className={`flex items-center gap-2 px-8 py-3 text-white rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95
                                    ${!customerId 
                                        ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'
                                    }`}
                            >
                                <Save size={18} />
                                Lưu hoá đơn
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in duration-300">
          <InvoiceHistoryView />
        </div>
      )}
    </div>
  );
};

export default InvoiceCreate;
