import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { X, UploadCloud, Plus, Loader2 } from 'lucide-react';
import type { Book } from '../types';
import { getAllCategories, type Category } from '../services/categoryService';
import { useToast } from '../components/Toast';

const BookForm: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { books, addBook, updateBook } = useStore();
    const { showToast } = useToast();
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
        dimensions: '',
        description: ''
    };

    const [formData, setFormData] = useState<Book>(initialFormState);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    // Fetch categories from database
    const fetchCategories = async () => {
        try {
            const cats = await getAllCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        setCreatingCategory(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch('http://localhost:5000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newCategoryName.trim() })
            });
            const data = await res.json();
            if (data.success) {
                await fetchCategories();
                handleChange('category', newCategoryName.trim());
                setNewCategoryName('');
                setShowNewCategoryInput(false);
            }
        } catch (err) {
            console.error('Error creating category:', err);
        } finally {
            setCreatingCategory(false);
        }
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let success = false;

        if (isEditMode && id) {
            success = await updateBook(id, formData);
            if (success) {
                showToast('Cập nhật sách thành công!', 'success');
            }
        } else {
            success = await addBook(formData);
            if (success) {
                showToast('Thêm sách mới thành công!', 'success');
            }
        }

        if (success) {
            navigate('/books');
        }
    };

    return (
        <div className="space-y-4">
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
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.category}
                                        onChange={e => handleChange('category', e.target.value)}
                                    >
                                        <option value="">Chọn thể loại</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategoryInput(true)}
                                        className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        title="Thêm thể loại mới"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                                {/* Inline New Category Input */}
                                {showNewCategoryInput && (
                                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Thêm thể loại mới:</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newCategoryName}
                                                onChange={e => setNewCategoryName(e.target.value)}
                                                placeholder="Tên thể loại..."
                                                className="flex-1 p-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCreateCategory}
                                                disabled={creatingCategory || !newCategoryName.trim()}
                                                className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                                            >
                                                {creatingCategory ? <Loader2 size={14} className="animate-spin" /> : 'Thêm'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setShowNewCategoryInput(false); setNewCategoryName(''); }}
                                                className="px-3 py-2 border border-slate-200 text-slate-600 text-sm rounded-lg hover:bg-slate-100"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                )}
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
                                    onChange={e => handleChange('dimensions', e.target.value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Mô tả sản phẩm</label>
                                <textarea
                                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                                    placeholder="Nhập mô tả chi tiết về sách..."
                                    value={formData.description || ''}
                                    onChange={e => handleChange('description', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Images & Actions */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-3">Hình ảnh sách</h3>
                        <input
                            type="file"
                            id="imageUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        handleChange('imageUrl', reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <div
                            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-100 transition-colors cursor-pointer group"
                            onClick={() => document.getElementById('imageUpload')?.click()}
                        >
                            {formData.imageUrl ? (
                                <div className="relative">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-48 object-contain rounded mb-4" />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleChange('imageUrl', ''); }}
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