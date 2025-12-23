import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2, Printer } from 'lucide-react';

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { books } = useStore();
  
  const book = books.find(b => b.id === id);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <p className="text-xl font-semibold mb-4">Không tìm thấy sách!</p>
        <button 
           onClick={() => navigate('/books')}
           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
           Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
       {/* Breadcrumb */}
       <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/')}>Dashboard</span>
          <ChevronRight size={14} />
          <span className="cursor-pointer hover:text-blue-600" onClick={() => navigate('/books')}>Sách</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-blue-600 truncate max-w-[200px]">{book.title}</span>
       </div>

       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
             
             {/* Left Column: Image Gallery */}
             <div className="md:col-span-5 p-8 border-r border-slate-100 flex flex-col items-center">
                 <div className="w-full max-w-[360px] aspect-[3/4] mb-6 relative group">
                    <img 
                      src={book.imageUrl} 
                      alt={book.title} 
                      className="w-full h-full object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105" 
                    />
                 </div>
                 {/* Thumbnails (Mockup) */}
                 <div className="flex gap-4 mt-4 overflow-x-auto pb-2 w-full justify-center">
                    {[book.imageUrl, book.imageUrl, book.imageUrl].map((img, i) => (
                        <div key={i} className={`w-16 h-20 border-2 rounded cursor-pointer overflow-hidden ${i === 0 ? 'border-blue-500' : 'border-transparent hover:border-slate-300'}`}>
                           <img src={img} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                 </div>
             </div>

             {/* Right Column: Info */}
             <div className="md:col-span-7 p-8">
                 <h1 className="text-3xl font-bold text-slate-900 mb-4">{book.title}</h1>
                 
                 <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600 mb-6">
                    <div>Nhà cung cấp: <span className="font-medium text-blue-600 cursor-pointer">{book.supplier || 'Đang cập nhật'}</span></div>
                    <div>Tác giả: <span className="font-medium text-slate-900">{book.author}</span></div>
                    <div>Nhà xuất bản: <span className="font-medium text-slate-900">{book.publisher}</span></div>
                    <div>Hình thức bìa: <span className="font-medium text-slate-900">{book.coverForm || 'Bìa mềm'}</span></div>
                 </div>

                 <div className="flex items-center gap-3 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100 w-fit">
                    <span className="text-sm text-slate-500 font-medium">Giá bán:</span>
                    <span className="text-3xl font-bold text-blue-600">{book.price.toLocaleString()} đ</span>
                 </div>

                 {/* Specifications Table */}
                 <div className="mb-8">
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">Thông tin chi tiết</h3>
                    <table className="w-full text-sm">
                       <tbody className="divide-y divide-slate-100">
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Mã hàng</td>
                             <td className="font-medium text-slate-900">{book.id}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Tên nhà cung cấp</td>
                             <td className="font-medium text-blue-600">{book.supplier || 'Đang cập nhật'}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Tác giả</td>
                             <td className="font-medium text-slate-900">{book.author}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">NXB</td>
                             <td className="font-medium text-slate-900">{book.publisher}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Năm XB</td>
                             <td className="font-medium text-slate-900">{book.publishYear}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Trọng lượng (gr)</td>
                             <td className="font-medium text-slate-900">{book.weight || 300}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Kích thước bao bì</td>
                             <td className="font-medium text-slate-900">{book.dimensions || 'N/A'}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Số trang</td>
                             <td className="font-medium text-slate-900">{book.pages || 'N/A'}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Hình thức</td>
                             <td className="font-medium text-slate-900">{book.coverForm || 'Bìa Mềm'}</td>
                          </tr>
                          <tr className="flex py-2">
                             <td className="w-40 text-slate-500">Tồn kho</td>
                             <td className="font-bold text-green-600">{book.stock}</td>
                          </tr>
                       </tbody>
                    </table>
                 </div>

                 {/* Description */}
                 <div>
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">Mô tả sản phẩm</h3>
                    <div className="text-slate-600 text-sm leading-relaxed text-justify">
                        {book.description || 'Chưa có mô tả cho sản phẩm này.'}
                    </div>
                 </div>

             </div>
          </div>
       </div>
    </div>
  );
};

export default BookDetail;