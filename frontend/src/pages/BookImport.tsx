import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import { Plus, Trash2, AlertCircle, Save, X, UploadCloud, Minus, History, FilePlus, ChevronDown, ChevronUp } from 'lucide-react';
import { Book, ImportTicket } from '../types';
import { useNavigate } from 'react-router-dom';
import DatePicker from '../components/DatePicker';

interface ImportItem {
  id: string; // Temporary ID for list management
  bookDetails: Book;
  quantity: number;
}

const ImportHistoryView: React.FC = () => {
  const { importHistory, getBook } = useStore();
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);

  const filteredHistory = importHistory.filter(ticket => ticket.date.startsWith(filterDate));

  const toggleExpand = (ticketId: string) => {
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
        {filteredHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map(ticket => {
              const totalQuantity = ticket.items.reduce((sum, item) => sum + item.quantity, 0);
              const isExpanded = expandedTicketId === ticket.id;

              return (
                <div key={ticket.id}>
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => toggleExpand(ticket.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <FilePlus size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{ticket.id}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(ticket.date).toLocaleString('vi-VN')} • {ticket.items.length} đầu sách • Tổng {totalQuantity} cuốn
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <ChevronDown size={20} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 animate-in fade-in duration-200">
                      <h4 className="font-semibold text-sm text-slate-600 mb-2">Chi tiết phiếu nhập:</h4>
                      <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
                        {ticket.items.map((item, index) => {
                          const book = getBook(item.bookId);
                          return (
                            <li key={index} className="flex items-center justify-between p-3 text-sm">
                              <span className="font-medium text-slate-800">{book?.title || 'Sách không còn tồn tại'}</span>
                              <span className="text-slate-500">Số lượng: <b className="text-blue-600">{item.quantity}</b></span>
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
  const navigate = useNavigate();
  const [items, setItems] = useState<ImportItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  const initialBookState: Book = {
    id: '', 
    title: '',
    category: 'Văn học',
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
    setIsModalOpen(true);
  };

  const handleModalChange = (field: keyof Book, value: any) => {
    setCurrentBook(prev => ({ ...prev, [field]: value }));
  };

  const handleAddBookToTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBook.title || !currentBook.author || currentBook.price <= 0) {
      alert("Vui lòng nhập đầy đủ thông tin sách (Tên, Tác giả, Giá)");
      return;
    }
    if (currentQuantity < rules.minImportQuantity) {
      alert(`Số lượng nhập phải ít nhất là ${rules.minImportQuantity}`);
      return;
    }

    setItems([...items, { id: Date.now().toString(), bookDetails: { ...currentBook }, quantity: currentQuantity }]);
    setIsModalOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleSaveTicket = () => {
    setError(null);
    setSuccess(null);
    if (items.length === 0) {
      setError('Phiếu nhập chưa có sách nào.');
      return;
    }

    const payload = items.map(i => ({ bookDetails: i.bookDetails, quantity: i.quantity }));
    const result = importBooks(payload);

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
    <div className="max-w-6xl mx-auto space-y-6">
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
          <p className="text-sm text-slate-500 mb-6 bg-blue-50 p-3 rounded-lg text-blue-700 border border-blue-100 flex items-center gap-2">
            <AlertCircle size={16} />
            Quy định (QĐ1): Nhập ít nhất {rules.minImportQuantity} cuốn. Chỉ nhập sách có tồn kho dưới {rules.maxStockBeforeImport}.
          </p>

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

          <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-4 py-3 text-center w-12">STT</th>
                    <th className="px-4 py-3">Tên sách</th>
                    <th className="px-4 py-3">Tác giả</th>
                    <th className="px-4 py-3">Giá bìa</th>
                    <th className="px-4 py-3 text-center">Số lượng nhập</th>
                    <th className="px-4 py-3 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.bookDetails.title}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{item.bookDetails.author}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">{item.bookDetails.price.toLocaleString()}đ</td>
                      <td className="px-4 py-3 text-center">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                              {item.quantity}
                          </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                      <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-100 rounded-xl shadow-2xl w-full max-w-6xl my-8 animate-in fade-in zoom-in duration-200">
                <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-xl sticky top-0 z-10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Chi tiết sách nhập</h3>
                        <p className="text-sm text-slate-500">Điền thông tin sách để thêm vào phiếu nhập</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleAddBookToTicket} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Thông tin chung</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Tên sách <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nhập tên sách..." value={currentBook.title} onChange={e => handleModalChange('title', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Tác giả <span className="text-red-500">*</span></label>
                                        <input type="text" required className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Tên tác giả" value={currentBook.author} onChange={e => handleModalChange('author', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Thể loại</label>
                                        <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" value={currentBook.category} onChange={e => handleModalChange('category', e.target.value)}>
                                            <option value="Văn học">Văn học</option>
                                            <option value="Kinh tế">Kinh tế</option>
                                            <option value="Thiếu nhi">Thiếu nhi</option>
                                            <option value="Kỹ năng">Kỹ năng</option>
                                            <option value="Giáo khoa">Giáo khoa</option>
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
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Kích thước</label>
                                        <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="VD: 20 x 15 x 2 cm" value={currentBook.dimensions || ''} onChange={e => handleModalChange('dimensions', e.target.value)} />
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
                                        <input type="number" required className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900" value={currentBook.price === 0 ? '' : currentBook.price} onChange={e => handleModalChange('price', e.target.value === '' ? 0 : parseInt(e.target.value))} placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng nhập <span className="text-red-500">*</span></label>
                                        <div className="flex items-center justify-center border border-slate-300 rounded-lg overflow-hidden w-full">
                                            <button type="button" onClick={() => setCurrentQuantity(prev => Math.max(0, prev - 1))} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-r border-slate-300 text-slate-600 transition-colors active:bg-slate-200"><Minus size={20} /></button>
                                            <input type="number" required className="w-full p-3 text-center bg-white text-xl focus:outline-none font-bold text-blue-600" value={currentQuantity === 0 ? '' : currentQuantity} onChange={e => setCurrentQuantity(e.target.value === '' ? 0 : parseInt(e.target.value))} placeholder="0" />
                                            <button type="button" onClick={() => setCurrentQuantity(prev => prev + 1)} className="px-4 py-3 bg-slate-50 hover:bg-slate-100 border-l border-slate-300 text-slate-600 transition-colors active:bg-slate-200"><Plus size={20} /></button>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">Tối thiểu theo quy định: {rules.minImportQuantity}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Hình ảnh</h3>
                                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer group">
                                    {currentBook.imageUrl ? (
                                        <div className="relative"><img src={currentBook.imageUrl} alt="Preview" className="w-full h-40 object-contain rounded mb-2" /><button type="button" onClick={() => handleModalChange('imageUrl', '')} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"><X size={14} /></button></div>
                                    ) : (
                                        <div className="py-2"><div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><UploadCloud size={20} /></div><p className="text-xs font-medium text-slate-700">Chọn ảnh</p></div>
                                    )}
                                </div>
                                <div className="mt-4"><input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Hoặc nhập URL ảnh..." value={currentBook.imageUrl || ''} onChange={e => handleModalChange('imageUrl', e.target.value)} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200 bg-slate-100 sticky bottom-0">
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