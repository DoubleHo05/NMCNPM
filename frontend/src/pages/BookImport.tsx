import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import { usePermissions } from '../hooks/usePermissions';
import { Plus, Trash2, AlertCircle, Save, X, UploadCloud, Minus, History, FilePlus, ChevronDown, ShieldAlert } from 'lucide-react';
import type { Book } from '../types';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/DatePicker';
import { getAllCategories, type Category } from '../services/categoryService';
import { useToast } from '../components/Toast';

interface ImportItem {
  id: string; // Temporary ID for list management
  bookDetails: Book;
  quantity: number;
}

const ImportHistoryView: React.FC = () => {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const { inventoryService } = await import('../services/inventoryService');
        const res: any = await inventoryService.getImportHistory();
        if (res.success) {
          setHistory(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(ticket =>
    ticket.ngayNhap && ticket.ngayNhap.startsWith(filterDate)
  );

  const toggleExpand = (ticketId: number) => {
    setExpandedTicketId(expandedTicketId === ticketId ? null : ticketId);
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
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : filteredHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map(ticket => {
              const totalQuantity = ticket.chiTiet.reduce((sum: number, item: any) => sum + item.soLuongNhap, 0);
              const isExpanded = expandedTicketId === ticket.maPhieuNhap;

              return (
                <div key={ticket.maPhieuNhap}>
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpand(ticket.maPhieuNhap)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <FilePlus size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">PN #{ticket.maPhieuNhap}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(ticket.ngayNhap).toLocaleString('vi-VN')} • Người nhập: {ticket.nhanVien?.hoTen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="font-semibold text-blue-600">{totalQuantity} cuốn</p>
                        <p className="text-xs text-slate-500 font-medium">{Number(ticket.tongTienNhap).toLocaleString()}đ</p>
                      </div>
                      <ChevronDown size={20} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 animate-in fade-in duration-200">
                      <h4 className="font-semibold text-sm text-slate-600 mb-2">Chi tiết phiếu nhập:</h4>
                      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
                        {ticket.chiTiet.map((item: any, index: number) => {
                          return (
                            <li key={index} className="flex items-center justify-between p-3 text-sm">
                              <div>
                                <span className="font-medium text-slate-800 block">{item.sach?.tenSach || 'Sách không xác định'}</span>
                                <span className="text-xs text-slate-400">ISBN: {item.sach?.isbn}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-slate-500 block">SL: <b className="text-blue-600">{item.soLuongNhap}</b></span>
                                <span className="text-xs text-slate-500">{Number(item.giaNhap).toLocaleString()}đ/cuốn</span>
                              </div>
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
            <h3 className="font-semibold text-slate-700">Không có lịch sử nhập</h3>
            <p className="text-sm">Chưa có phiếu nhập nào được tạo trong ngày này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BookImport: React.FC = () => {
  const { importBooks, rules, addNotification } = useStore();
  const { canImportBooks, userRole } = usePermissions();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [items, setItems] = useState<ImportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [modalErrors, setModalErrors] = useState<{ title?: string; author?: string; price?: string; quantity?: string }>({});

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast("File quá lớn (Max 5MB)", 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleModalChange('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Show access denied if user doesn't have permission
  if (!canImportBooks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="text-red-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-slate-600 mb-4">
            Bạn không có quyền nhập sách. Chức năng này chỉ dành cho <strong>Thủ kho</strong> và <strong>Quản lý</strong>.
          </p>
          <p className="text-sm text-slate-500">
            Vai trò của bạn: <span className="font-semibold">{userRole === 'THU_NGAN' ? 'Thu ngân' : userRole}</span>
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

  const initialBookState: Book = {
    id: '',
    isbn: '',
    title: '',
    category: categories.length > 0 ? categories[0].name : '',
    author: '',
    stock: 0,
    price: 0,
    publisher: '',
    publishYear: new Date().getFullYear(),
    imageUrl: '',
    weight: 0,
    pages: 0,
    dimensions: ''
  };
  const [currentBook, setCurrentBook] = useState<Book>(initialBookState);
  const [currentQuantity, setCurrentQuantity] = useState<number>(rules.minImportQuantity);

  const handleOpenModal = () => {
    setCurrentBook({ ...initialBookState, id: `B${Math.floor(Math.random() * 100000)}` });
    setCurrentQuantity(rules.minImportQuantity);
    setError(null);
    setModalErrors({});
    setIsModalOpen(true);
  };

  const handleModalChange = (field: keyof Book, value: any) => {
    setCurrentBook(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (field === 'title' && modalErrors.title) setModalErrors(prev => ({ ...prev, title: undefined }));
    if (field === 'author' && modalErrors.author) setModalErrors(prev => ({ ...prev, author: undefined }));
    if (field === 'price' && modalErrors.price) setModalErrors(prev => ({ ...prev, price: undefined }));
  };

  const handleAddBookToTicket = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate và collect errors
    const errors: { title?: string; author?: string; price?: string; quantity?: string } = {};

    if (!currentBook.title.trim()) {
      errors.title = 'Vui lòng nhập tên sách';
    }
    if (!currentBook.author.trim()) {
      errors.author = 'Vui lòng nhập tác giả';
    }
    if (currentBook.price <= 0) {
      errors.price = 'Giá sách phải lớn hơn 0';
    }
    if (currentQuantity < rules.minImportQuantity) {
      errors.quantity = `Số lượng nhập phải ít nhất là ${rules.minImportQuantity}`;
    }

    // Nếu có lỗi, hiển thị và không submit
    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      return;
    }

    setItems([...items, { id: Date.now().toString(), bookDetails: { ...currentBook }, quantity: currentQuantity }]);
    setModalErrors({});
    setIsModalOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleSaveTicket = async () => {
    setError(null);
    setSuccess(null);
    if (items.length === 0) {
      setError('Phiếu nhập chưa có sách nào.');
      return;
    }

    const payload = items.map(i => ({ bookDetails: i.bookDetails, quantity: i.quantity }));
    const result = await importBooks(payload);

    if (result.success) {
      setSuccess(result.message);
      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      addNotification({
        type: 'import',
        title: 'Nhập kho thành công',
        message: `Đã nhập ${items.length} đầu sách với tổng số ${totalQuantity} cuốn.`
      });
      setItems([]);
      setTimeout(() => setActiveTab('history'), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản lý Nhập Sách (BM1)</h2>
          <div className="text-sm text-slate-500 mt-1">
            Dashboard <span className="mx-2">›</span> Sách <span className="mx-2">›</span> Nhập kho
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
          <Plus size={16} /> Lập phiếu nhập
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
             ${activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          <History size={16} /> Lịch sử nhập
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in duration-300">
          <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded-lg text-blue-700 border border-blue-100 flex items-center gap-2">
            <AlertCircle size={16} />
            Quy định (QĐ1): Nhập ít nhất {rules.minImportQuantity} cuốn. Chỉ nhập sách có tồn kho dưới {rules.maxStockBeforeImport}.
          </p>

          {/* Hiển thị tổng hợp các vi phạm quy định */}
          {items.length > 0 && (() => {
            const violations = items.filter(item => item.quantity < rules.minImportQuantity);
            if (violations.length > 0) {
              return (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <div className="flex items-center gap-2 font-semibold mb-2">
                    <AlertCircle size={18} />
                    Vi phạm quy định QĐ1 ({violations.length} sách):
                  </div>
                  <ul className="text-sm space-y-1 ml-6 list-disc">
                    {violations.map(v => (
                      <li key={v.id}>
                        <span className="font-medium">{v.bookDetails.title}</span>: số lượng {v.quantity} cuốn (yêu cầu tối thiểu {rules.minImportQuantity})
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
            return null;
          })()}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <Save size={20} />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <div className="border rounded-lg overflow-hidden mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-2 py-3 text-center w-10">STT</th>
                  <th className="px-2 py-3 w-28">ISBN</th>
                  <th className="px-2 py-3">Tên sách</th>
                  <th className="px-2 py-3">Tác giả</th>
                  <th className="px-2 py-3">Thể loại</th>
                  <th className="px-2 py-3">NXB</th>
                  <th className="px-2 py-3 text-center w-16">Năm XB</th>
                  <th className="px-2 py-3 text-right w-24">Giá bìa</th>
                  <th className="px-2 py-3 text-center w-20">SL nhập</th>
                  <th className="px-2 py-3 text-center w-16">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => {
                  // Kiểm tra vi phạm quy định
                  const isQtyViolation = item.quantity < rules.minImportQuantity;

                  return (
                    <tr key={item.id} className={`hover:bg-slate-50 ${isQtyViolation ? 'bg-red-50' : ''}`}>
                      <td className="px-2 py-2 text-center text-slate-500 text-sm">{index + 1}</td>
                      <td className="px-2 py-2 text-slate-600 text-xs font-mono">{item.bookDetails.isbn || '-'}</td>
                      <td className="px-2 py-2 font-medium text-slate-900 text-sm">{item.bookDetails.title}</td>
                      <td className="px-2 py-2 text-slate-600 text-sm">{item.bookDetails.author}</td>
                      <td className="px-2 py-2 text-slate-600 text-sm">{item.bookDetails.category || '-'}</td>
                      <td className="px-2 py-2 text-slate-600 text-sm">{item.bookDetails.publisher || '-'}</td>
                      <td className="px-2 py-2 text-slate-600 text-sm text-center">{item.bookDetails.publishYear || '-'}</td>
                      <td className="px-2 py-2 text-slate-600 text-sm text-right">{item.bookDetails.price.toLocaleString()}đ</td>
                      <td className="px-2 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${isQtyViolation ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.quantity}
                        </span>
                        {isQtyViolation && (
                          <div className="text-xs text-red-500 mt-1">Min: {rules.minImportQuantity}</div>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-400 italic">
                      Chưa có sách nào trong phiếu nhập. Bấm "Thêm sách" để bắt đầu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button type="button" onClick={handleOpenModal} className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-sm transition-colors">
              <Plus size={18} />
              Thêm sách
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate('/books')} className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors">
                Hủy bỏ
              </button>
              <button type="button" onClick={handleSaveTicket} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium shadow-sm transition-colors">
                <Save size={18} />
                Lưu phiếu nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in duration-300">
          <ImportHistoryView />
        </div>
      )}

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col my-8 animate-in fade-in zoom-in duration-200 overflow-hidden">
            {/* Header - Fixed */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-none z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Chi tiết sách nhập</h3>
                <p className="text-sm text-slate-500">Điền thông tin sách để thêm vào phiếu nhập</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddBookToTicket} noValidate className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6">
                {/* Hiển thị tổng hợp lỗi validation nếu có */}
                {Object.keys(modalErrors).length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <div className="flex items-center gap-2 font-semibold mb-2">
                      <AlertCircle size={18} />
                      Vui lòng sửa các lỗi sau:
                    </div>
                    <ul className="list-disc ml-6 text-sm space-y-1">
                      {modalErrors.title && <li>{modalErrors.title}</li>}
                      {modalErrors.author && <li>{modalErrors.author}</li>}
                      {modalErrors.price && <li>{modalErrors.price}</li>}
                      {modalErrors.quantity && <li>{modalErrors.quantity}</li>}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Thông tin chung</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Tên sách <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none ${modalErrors.title ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                            placeholder="Nhập tên sách..."
                            value={currentBook.title}
                            onChange={e => handleModalChange('title', e.target.value)}
                          />
                          {modalErrors.title && <p className="text-red-500 text-xs mt-1 font-medium">{modalErrors.title}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">ISBN</label>
                          <input
                            type="text"
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="VD: 978-604-xxx-xxx"
                            maxLength={20}
                            value={currentBook.isbn || ''}
                            onChange={e => handleModalChange('isbn', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Tác giả <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            className={`w-full p-2.5 bg-white border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none ${modalErrors.author ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                            placeholder="Tên tác giả"
                            value={currentBook.author}
                            onChange={e => handleModalChange('author', e.target.value)}
                          />
                          {modalErrors.author && <p className="text-red-500 text-xs mt-1 font-medium">{modalErrors.author}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Thể loại</label>
                          <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={currentBook.category} onChange={e => handleModalChange('category', e.target.value)}>
                            {categories.length > 0 ? (
                              categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                              ))
                            ) : (
                              <option value="">Đang tải...</option>
                            )}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Năm xuất bản</label>
                          <input type="number" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={currentBook.publishYear === 0 ? '' : currentBook.publishYear} onChange={e => handleModalChange('publishYear', e.target.value === '' ? 0 : parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Nhà xuất bản</label>
                          <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nhập tên NXB" value={currentBook.publisher} onChange={e => handleModalChange('publisher', e.target.value)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Trọng lượng (g)</label>
                          <input type="number" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 300" value={currentBook.weight || ''} onChange={e => handleModalChange('weight', parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Số trang</label>
                          <input type="number" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 250" value={currentBook.pages || ''} onChange={e => handleModalChange('pages', parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Kích thước</label>
                          <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 20 x 15 x 2 cm" value={currentBook.dimensions || ''} onChange={e => handleModalChange('dimensions', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả sản phẩm</label>
                          <textarea
                            rows={4}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Nhập mô tả chi tiết cho sách..."
                            value={currentBook.description || ''}
                            onChange={e => handleModalChange('description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border-2 border-blue-100 shadow-sm">
                      <h3 className="font-semibold text-blue-700 mb-4 border-b border-blue-50 pb-3">Dữ liệu nhập kho</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Giá nhập/bìa (VNĐ) <span className="text-red-500">*</span></label>
                          <input
                            type="number"
                            className={`w-full p-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 ${modalErrors.price ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                            value={currentBook.price === 0 ? '' : currentBook.price}
                            onChange={e => handleModalChange('price', e.target.value === '' ? 0 : parseInt(e.target.value))}
                            placeholder="0"
                          />
                          {modalErrors.price && <p className="text-red-500 text-xs mt-1 font-medium">{modalErrors.price}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng nhập <span className="text-red-500">*</span></label>
                          <div className={`flex items-center justify-center border rounded-lg overflow-hidden w-full ${modalErrors.quantity ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}>
                            <button type="button" onClick={() => {
                              setCurrentQuantity(prev => Math.max(0, prev - 1));
                              if (modalErrors.quantity) setModalErrors(prev => ({ ...prev, quantity: undefined }));
                            }} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-300 text-slate-600 transition-colors active:bg-slate-200"><Minus size={20} /></button>
                            <input
                              type="number"
                              className={`w-full p-3 text-center text-xl focus:outline-none font-bold ${modalErrors.quantity ? 'bg-red-50 text-red-600' : 'bg-white text-blue-600'}`}
                              value={currentQuantity === 0 ? '' : currentQuantity}
                              onChange={e => {
                                setCurrentQuantity(e.target.value === '' ? 0 : parseInt(e.target.value));
                                if (modalErrors.quantity) setModalErrors(prev => ({ ...prev, quantity: undefined }));
                              }}
                              placeholder="0"
                            />
                            <button type="button" onClick={() => {
                              setCurrentQuantity(prev => prev + 1);
                              if (modalErrors.quantity) setModalErrors(prev => ({ ...prev, quantity: undefined }));
                            }} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-l border-slate-300 text-slate-600 transition-colors active:bg-slate-200"><Plus size={20} /></button>
                          </div>
                          {modalErrors.quantity ? (
                            <p className="text-red-500 text-xs mt-1 font-medium">{modalErrors.quantity}</p>
                          ) : (
                            <p className="text-xs text-slate-500 mt-1">Tối thiểu theo quy định: {rules.minImportQuantity}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Hình ảnh</h3>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer group"
                      >
                        {currentBook.imageUrl ? (
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <img
                              src={currentBook.imageUrl}
                              alt="Preview"
                              className="w-full h-40 object-contain rounded mb-2"
                              onError={(e) => {
                                e.currentTarget.onerror = null; // Prevent infinite loop
                                e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Lỗi+Ảnh'; // Fallback image
                              }}
                            />
                            <button type="button" onClick={() => handleModalChange('imageUrl', '')} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={14} /></button>
                          </div>
                        ) : (
                          <div className="py-2"><div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><UploadCloud size={20} /></div><p className="text-xs font-medium text-slate-700">Chọn ảnh</p></div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                      <div className="mt-4"><input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Hoặc nhập URL ảnh..." value={currentBook.imageUrl || ''} onChange={e => handleModalChange('imageUrl', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed at bottom of modal card */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-100 rounded-b-xl flex-none">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">Hủy bỏ</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors">Thêm vào phiếu</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default BookImport;