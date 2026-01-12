import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { usePermissions } from '../hooks/usePermissions';
import {
  Plus, Trash2, Search, ShoppingCart, User,
  Minus, CreditCard, History, LayoutGrid, List,
  Package, DollarSign
} from 'lucide-react';
import { Customer } from '../types';
import PaymentModal from '../components/PaymentModal';

interface InvoiceItem {
  bookId: string;
  quantity: number;
}

const InvoiceCreate: React.FC = () => {
  const { books, customers, createInvoice, rules, addNotification, getCustomer, collectMoney } = useStore();
  const { canCreateInvoice, userRole } = usePermissions();

  // State
  const [activeTab, setActiveTab] = useState<'pos' | 'history'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Cart State
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter books
  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return books.filter(b =>
      b.stock > 0 && // Only show books in stock
      (b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q))
    );
  }, [books, searchQuery]);

  // Cart Calculations
  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const book = books.find(b => b.id === item.bookId);
      return total + (book ? book.price * item.quantity : 0);
    }, 0);
  }, [items, books]);

  // Handlers
  const handleAddToCart = (bookId: string) => {
    setItems(prev => {
      const existing = prev.find(i => i.bookId === bookId);
      if (existing) {
        // Check stock limit
        const book = books.find(b => b.id === bookId);
        if (book && existing.quantity >= book.stock) return prev;

        return prev.map(i => i.bookId === bookId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { bookId, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (bookId: string, delta: number) => {
    setItems(prev => prev.map(item => {
      if (item.bookId === bookId) {
        const book = books.find(b => b.id === bookId);
        const maxStock = book ? book.stock : 0;
        const newQty = Math.min(Math.max(1, item.quantity + delta), maxStock);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleRemoveFromCart = (bookId: string) => {
    setItems(prev => prev.filter(i => i.bookId !== bookId));
  };

  const handlePaymentConfirm = async (amountPaid: number) => {
    if (!customerId) return;
    setIsProcessing(true);

    try {
      // 1. Create Invoice (await async call)
      const invoiceResult = await createInvoice(customerId, items);

      if (invoiceResult.success) {
        // 2. Record Payment if amount > 0
        if (amountPaid > 0) {
          await collectMoney(customerId, amountPaid);
        }

        const customer = getCustomer(customerId);
        addNotification({
          type: 'invoice',
          title: 'Bán hàng thành công',
          message: `Đơn hàng ${formatCurrency(invoiceResult.totalAmount)}đ cho ${customer?.name}`
        });

        // Show success in modal (keep modal open for printing)
        // Extract invoice ID from message if available
        const idMatch = invoiceResult.message.match(/#(\d+)/);
        if (idMatch) {
          setCompletedInvoiceId('HD-' + idMatch[1]);
        } else {
          setCompletedInvoiceId('HD-' + Date.now());
        }

        // Cleanup cart, but keep modal open
        setItems([]);
        setCustomerId('');
      } else {
        alert(invoiceResult.message);
        setIsPaymentModalOpen(false); // Close on error
      }
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      setIsPaymentModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN');

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Header Tabs */}
      <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2
                ${activeTab === 'pos' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutGrid size={18} /> Bán hàng
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2
                ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <History size={18} /> Lịch sử
          </button>
        </div>

        {activeTab === 'pos' && (
          <div className="flex items-center gap-2 mr-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm sách..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}><List size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {activeTab === 'pos' ? (
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Left: Product List */}
          <div className="flex-[7] overflow-y-auto pr-2 pb-20">
            {filteredBooks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Package size={48} className="mb-4 opacity-50" />
                <p>Không tìm thấy sách nào</p>
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {filteredBooks.map(book => (
                  <div
                    key={book.id}
                    onClick={() => handleAddToCart(book.id)}
                    className={`bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group flex ${viewMode === 'list' ? 'flex-row items-center h-24' : 'flex-col'}`}
                  >
                    {/* Image */}
                    <div className={`${viewMode === 'list' ? 'w-20 h-full p-2' : 'aspect-[3/4] w-full'} bg-slate-100 relative overflow-hidden`}>
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs">No Img</div>
                      )}
                      {/* Overlay Add Button */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white text-blue-600 rounded-full p-2 scale-75 group-hover:scale-100 transition-transform">
                          <Plus size={24} />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 leading-tight mb-1" title={book.title}>{book.title}</h3>
                        <p className="text-xs text-slate-500 mb-1">{book.author}</p>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">{book.category}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-blue-600 font-bold text-sm tracking-tight">{formatCurrency(book.price)}đ</span>
                        <span className="text-[10px] text-slate-400">Ton: {book.stock}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Cart Panel */}
          <div className="flex-[3] bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            {/* Customer Select */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <User size={18} className={`mr-2 ${customerId ? 'text-blue-600 ' : 'text-slate-400'}`} />
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium outline-none text-slate-800"
                >
                  <option value="">Chọn khách lẻ...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {customerId && (
                <div className="mt-2 flex justify-between text-xs px-1">
                  <span className="text-slate-500">Nợ hiện tại:</span>
                  <span className="font-bold text-red-500">{formatCurrency(getCustomer(customerId)?.currentDebt || 0)}đ</span>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart size={40} className="mb-3 opacity-20" />
                  <p className="text-sm">Giỏ hàng trống</p>
                </div>
              ) : (
                items.map(item => {
                  const book = books.find(b => b.id === item.bookId);
                  if (!book) return null;
                  return (
                    <div key={item.bookId} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                      <div className="w-12 h-16 bg-white rounded border border-slate-200 overflow-hidden shrink-0">
                        {book.imageUrl && <img src={book.imageUrl} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-900 truncate">{book.title}</h4>
                        <p className="text-xs text-blue-600 font-bold mt-1">{formatCurrency(book.price)}đ</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {/* Qty Controls */}
                        <div className="flex items-center bg-white rounded border border-slate-300 h-7 overflow-hidden">
                          <button onClick={() => handleUpdateQuantity(item.bookId, -1)} className="px-2 hover:bg-slate-100 text-slate-600"><Minus size={12} /></button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.bookId, 1)} className="px-2 hover:bg-slate-100 text-slate-600"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item.bookId)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Total */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tạm tính</span>
                  <span className="font-semibold">{formatCurrency(cartTotal)}đ</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Tổng tiền</span>
                  <span className="text-xl text-blue-600">{formatCurrency(cartTotal)}đ</span>
                </div>
              </div>

              <button
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={items.length === 0 || !customerId}
                className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2
                    ${items.length === 0 || !customerId
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30'}`}
              >
                <DollarSign size={20} /> Thanh toán
              </button>
              {!customerId && items.length > 0 && (
                <div className="text-xs text-center text-red-500 mt-2 font-medium bg-red-50 py-1 rounded">Vui lòng chọn khách hàng</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 overflow-hidden">
          {/* Reuse existing history view logic here or create a component. 
               For brevity, adding placeholder or simple text */}
          <div className="text-center py-20 text-slate-400">
            <History size={48} className="mx-auto mb-4 opacity-50" />
            <p>Lịch sử hóa đơn đang được cập nhật...</p>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setCompletedInvoiceId(null);
        }}
        totalAmount={cartTotal}
        customer={getCustomer(customerId)}
        onConfirmPayment={handlePaymentConfirm}
        isProcessing={isProcessing}
        completedInvoiceId={completedInvoiceId}
      />
    </div>
  );
};

export default InvoiceCreate;

