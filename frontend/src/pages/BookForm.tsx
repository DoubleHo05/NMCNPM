import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { X, UploadCloud } from 'lucide-react';
import type { Book } from '../types';

const BookForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { books, addBook, updateBook } = useStore();
    const isEditMode = Boolean(id);

    const initialFormState: Book = {
        id: `B${Math.floor(Math.random() * 10000)}`, // Auto-generate ID for new books
        title: '',
        category: '',
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

    const [formData, setFormData] = useState<Book>(initialFormState);

    useEffect(() => {
        if (isEditMode && id) {
            const bookToEdit = books.find(b => b.id === id);
            if (bookToEdit) {
                setFormData(bookToEdit);
            } else {
                navigate('/books');
            }
        }
    }, [id, isEditMode, books, navigate]);

    const handleChange = (field: keyof Book, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && id) {
            updateBook(id, formData);
            alert('Cập nhật sách thành công!');
        } else {
            addBook(formData);
            alert('Thêm sách mới thành công!');
        }
        navigate('/books');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        {isEditMode ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
                    </h2>
                    <div className="text-sm text-slate-500 mt-1">
                        Dashboard <span className="mx-2">›</span> Sách <span className="mx-2">›</span> {isEditMode ? 'Chỉnh sửa' : 'Thêm mới'}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: General Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Thông tin sách</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tên sách</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nhập tên sách..."
                                    value={formData.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Tác giả</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Tên tác giả"
                                    value={formData.author}
                                    onChange={e => handleChange('author', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Năm xuất bản</label>
                                <input
                                    type="number"
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.publishYear}
                                    onChange={e => handleChange('publishYear', parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Trọng lượng (g)</label>
                                <input
                                    type="number"
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: 300"
                                    value={formData.weight || ''}
                                    onChange={e => handleChange('weight', parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Số trang</label>
                                <input
                                    type="number"
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: 250"
                                    value={formData.pages || ''}
                                    onChange={e => handleChange('pages', parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Thể loại</label>
                                <select
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                >
                                    <option value="">Chọn thể loại</option>
                                    <option value="Văn học">Văn học</option>
                                    <option value="Kinh tế">Kinh tế</option>
                                    <option value="Thiếu nhi">Thiếu nhi</option>
                                    <option value="Kỹ năng">Kỹ năng</option>
                                    <option value="Giáo khoa">Giáo khoa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Giá tiền (VNĐ)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.price}
                                    onChange={e => handleChange('price', parseInt(e.target.value) || 0)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nhà xuất bản</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Nhập tên NXB"
                                    value={formData.publisher}
                                    onChange={e => handleChange('publisher', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Kích thước bao bì</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="VD: 20 x 15 x 2 cm"
                                    value={formData.dimensions || ''}
                                    onChange={e => handleChange('dimensions', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Images & Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Hình ảnh sách</h3>
                        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer group">
                            {formData.imageUrl ? (
                                <div className="relative">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-contain rounded mb-4" />
                                    <button
                                        type="button"
                                        onClick={() => handleChange('imageUrl', '')}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud size={24} />
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">Kéo thả hoặc chọn ảnh</p>
                                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ JPG, PNG, SVG</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Hoặc nhập URL ảnh</label>
                            <input
                                type="text"
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://..."
                                value={formData.imageUrl || ''}
                                onChange={e => handleChange('imageUrl', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/books')}
                            className="flex-1 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                        >
                            Huỷ thay đổi
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm shadow-md transition-colors"
                        >
                            {isEditMode ? 'Lưu thay đổi' : 'Nhập sách'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BookForm;