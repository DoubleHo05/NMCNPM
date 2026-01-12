import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { usePermissions } from '../hooks/usePermissions';
import { Search, Filter, Download, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, RotateCcw, Check, RefreshCw, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const BookList: React.FC = () => {
  const { books, deleteBook, isLoadingBooks, booksError, refreshBooks } = useStore();
  const { canManageBooks } = usePermissions();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // -- Filter State --
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    stockStatus: 'all' // 'all', 'low', 'out'
  });

  // Get unique categories for dropdown
  const categories = Array.from(new Set(books.map(b => b.category))).filter(Boolean);

  // Sync with URL params
  useEffect(() => {
    const query = searchParams.get('search') || '';
    setSearchTerm(query);
    setCurrentPage(1);
  }, [searchParams]);

  // Reset to page 1 when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Filtering Logic
  const filteredBooks = books.filter(b => {
    // 1. Search Term
    const matchesSearch = 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Category Filter
    const matchesCategory = filters.category ? b.category === filters.category : true;

    // 3. Price Range Filter
    const price = b.price;
    const min = filters.minPrice ? parseInt(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseInt(filters.maxPrice) : Infinity;
    const matchesPrice = price >= min && price <= max;

    // 4. Stock Status Filter
    let matchesStock = true;
    if (filters.stockStatus === 'low') matchesStock = b.stock < 50;
    else if (filters.stockStatus === 'out') matchesStock = b.stock === 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesStock;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xoá sách "${title}"?`)) {
        deleteBook(id);
    }
  }

  const handleResetFilters = () => {
    setFilters({
        category: '',
        minPrice: '',
        maxPrice: '',
        stockStatus: 'all'
    });
  };

  const activeFilterCount = [
    filters.category, 
    filters.minPrice, 
    filters.maxPrice, 
    filters.stockStatus !== 'all'
  ].filter(Boolean).length;

  // Loading state
  if (isLoadingBooks) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-slate-600">Đang tải danh sách sách...</p>
      </div>
    );
  }

  // Error state
  if (booksError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-500 text-center">
          <p className="text-lg font-semibold">Lỗi tải dữ liệu</p>
          <p className="text-sm text-slate-600 mt-1">{booksError}</p>
        </div>
        <button
          onClick={() => refreshBooks()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Search Section */}
      <div className="flex flex-col gap-4">
        <div className="text-sm text-slate-500">
           Dashboard <span className="mx-2">›</span> <span className="font-semibold text-blue-600">Sách</span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
            <input
                type="text"
                placeholder="Tìm kiếm tên sách, tác giả..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm text-slate-900 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
                {/* Refresh Button */}
                <button
                  onClick={() => refreshBooks()}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-sm shadow-sm hover:bg-slate-50 transition-colors text-slate-700"
                  title="Làm mới danh sách"
                >
                  <RefreshCw size={16} />
                </button>
                
                <div className="relative">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg font-medium text-sm shadow-sm transition-colors
                            ${showFilters || activeFilterCount > 0 
                                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Filter size={16} />
                        <span>Bộ lọc</span>
                        {activeFilterCount > 0 && (
                            <span className="ml-1 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-[10px] rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                    
                    {/* Filter Dropdown Panel */}
                    {showFilters && (
                        <div className="absolute top-full right-0 mt-2 w-[320px] sm:w-[400px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-5 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-800">Bộ lọc tìm kiếm</h3>
                                <button 
                                    onClick={() => setShowFilters(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Thể loại</label>
                                    <select 
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={filters.category}
                                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                    >
                                        <option value="">Tất cả thể loại</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Stock Status Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Trạng thái kho</label>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setFilters(prev => ({ ...prev, stockStatus: 'all' }))}
                                            className={`flex-1 py-2 text-xs font-medium rounded-lg border ${filters.stockStatus === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            Tất cả
                                        </button>
                                        <button 
                                            onClick={() => setFilters(prev => ({ ...prev, stockStatus: 'low' }))}
                                            className={`flex-1 py-2 text-xs font-medium rounded-lg border ${filters.stockStatus === 'low' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            Sắp hết (&lt;50)
                                        </button>
                                        <button 
                                            onClick={() => setFilters(prev => ({ ...prev, stockStatus: 'out' }))}
                                            className={`flex-1 py-2 text-xs font-medium rounded-lg border ${filters.stockStatus === 'out' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            Hết hàng
                                        </button>
                                    </div>
                                </div>

                                {/* Price Range Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Khoảng giá (VNĐ)</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            placeholder="Từ..." 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input 
                                            type="number" 
                                            placeholder="Đến..." 
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                <button 
                                    onClick={handleResetFilters}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    <span>Đặt lại</span>
                                </button>
                                <button 
                                    onClick={() => setShowFilters(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                                >
                                    <Check size={16} />
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm shadow-sm transition-colors">
                    <Download size={16} />
                    <span>Xuất</span>
                </button>
                {canManageBooks && (
                  <Link to="/books/import" className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm transition-colors whitespace-nowrap">
                      <Plus size={16} />
                      <span>Thêm sách mới</span>
                  </Link>
                )}
            </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Active Filters Bar */}
        {activeFilterCount > 0 && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-blue-800 mr-2">Đang lọc theo:</span>
                {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                        Thể loại: {filters.category}
                        <button onClick={() => setFilters(prev => ({...prev, category: ''}))} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                        Giá: {filters.minPrice || '0'} - {filters.maxPrice || '∞'}
                        <button onClick={() => setFilters(prev => ({...prev, minPrice: '', maxPrice: ''}))} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                )}
                {filters.stockStatus !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-200 rounded text-xs text-blue-700">
                        Kho: {filters.stockStatus === 'low' ? 'Sắp hết' : 'Hết hàng'}
                        <button onClick={() => setFilters(prev => ({...prev, stockStatus: 'all'}))} className="hover:text-red-500"><X size={12}/></button>
                    </span>
                )}
                <button 
                    onClick={handleResetFilters}
                    className="ml-auto text-xs text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-2"
                >
                    Xóa tất cả
                </button>
            </div>
        )}

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4 w-16 text-center">STT</th>
                <th className="px-6 py-4">Sách</th>
                <th className="px-6 py-4">Thể loại</th>
                <th className="px-6 py-4">Tác giả</th>
                <th className="px-6 py-4">Số lượng</th>
                <th className="px-6 py-4">Nhà xuất bản</th>
                <th className="px-6 py-4">Năm XB</th>
                <th className="px-6 py-4">Giá tiền</th>
                <th className="px-6 py-4 text-center sticky right-0 bg-slate-50">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentBooks.map((book, index) => (
                <tr 
                    key={book.id} 
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/books/detail/${book.id}`)}
                >
                  <td className="px-6 py-4 text-slate-500 text-sm text-center">
                    {indexOfFirstItem + index + 1}
                  </td>
                  <td className="px-6 py-4 min-w-[250px]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-14 bg-slate-200 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                         <img src={book.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-blue-600 text-xs mb-0.5">{book.id}</span>
                        <p className="font-medium text-slate-900 text-sm leading-tight line-clamp-2">{book.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{book.category}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{book.author}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      book.stock < 50 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {book.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{book.publisher}</td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{book.publishYear}</td>
                  <td className="px-6 py-4 text-slate-700 text-sm font-medium whitespace-nowrap">
                    {book.price.toLocaleString()} đ
                  </td>
                  
                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-center sticky right-0 bg-white group-hover:bg-slate-50 shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.05)] border-l border-transparent group-hover:border-slate-100" onClick={e => e.stopPropagation()}>
                     <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => navigate(`/books/detail/${book.id}`)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" 
                            title="Xem chi tiết"
                        >
                            <Eye size={16} />
                        </button>
                        {canManageBooks && (
                          <>
                            <button 
                                onClick={() => navigate(`/books/edit/${book.id}`)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors" 
                                title="Chỉnh sửa"
                            >
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => handleDelete(book.id, book.title)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" 
                                title="Xoá"
                            >
                                <Trash2 size={16} />
                            </button>
                          </>
                        )}
                     </div>
                  </td>
                </tr>
              ))}
              {currentBooks.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={32} className="text-slate-300" />
                        <p>Không tìm thấy sách nào phù hợp.</p>
                        <p className="text-xs text-slate-400">
                            {activeFilterCount > 0 ? 'Thử điều chỉnh lại bộ lọc.' : 'Thử tìm kiếm bằng từ khóa khác hoặc thêm sách mới.'}
                        </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {filteredBooks.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
                <span className="text-sm text-slate-500">
                    Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBooks.length)} trong tổng số {filteredBooks.length} sách
                </span>
                <div className="flex gap-1">
                    <button 
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-slate-300 bg-white rounded-lg text-slate-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-slate-300 bg-white rounded-lg text-slate-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    
                    <div className="flex items-center px-4 font-medium text-sm text-slate-700 bg-white border border-slate-300 rounded-lg">
                        Trang {currentPage} / {totalPages || 1}
                    </div>

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 border border-slate-300 bg-white rounded-lg text-slate-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                    <button 
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 border border-slate-300 bg-white rounded-lg text-slate-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronsRight size={16} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default BookList;