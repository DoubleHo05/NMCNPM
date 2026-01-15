import React, { useState, useEffect } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    bookCount?: number;
}

const API_URL = 'http://localhost:5000/api';

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/categories`);
            const data = await res.json();
            if (data.success) setCategories(data.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const openModal = (category?: Category) => {
        if (category) {
            setEditingId(category.id);
            setFormData({ name: category.name });
        } else {
            setEditingId(null);
            setFormData({ name: '' });
        }
        setShowModal(true);
        setError('');
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Tên thể loại là bắt buộc');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const url = editingId ? `${API_URL}/categories/${editingId}` : `${API_URL}/categories`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: formData.name })
            });
            const data = await res.json();

            if (data.success) {
                setShowModal(false);
                fetchCategories();
                showToast('success', editingId ? 'Cập nhật thể loại thành công!' : 'Thêm thể loại thành công!');
            } else {
                setError(data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Không thể kết nối server');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/categories/${deleteConfirm.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                fetchCategories();
                showToast('success', 'Xóa thể loại thành công!');
            } else {
                showToast('error', data.message || 'Không thể xóa');
            }
        } catch (err) {
            showToast('error', 'Lỗi khi xóa');
        } finally {
            setDeleteConfirm(null);
        }
    };

    const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700',
        'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700'];

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {toast.message}
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Tag size={24} /> Quản lý Thể loại
                    </h2>
                    <p className="text-sm text-slate-500">Thêm, sửa, xóa thể loại sách</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCategories} className="p-2 border rounded-lg hover:bg-slate-50">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus size={18} /> Thêm thể loại
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : (
                <div className="flex flex-wrap gap-3">
                    {categories.map((c, idx) => (
                        <div key={c.id} className={`${colors[idx % colors.length]} px-4 py-2 rounded-full flex items-center gap-2 group`}>
                            <Tag size={16} />
                            <span className="font-medium">{c.name}</span>
                            <div className="hidden group-hover:flex gap-1 ml-2">
                                <button onClick={() => openModal(c)} className="p-0.5 hover:scale-110"><Pencil size={14} /></button>
                                <button onClick={() => setDeleteConfirm({ id: c.id, name: c.name })} className="p-0.5 hover:scale-110 text-red-600"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="w-full text-center py-12 text-slate-500">Chưa có thể loại nào</div>
                    )}
                </div>
            )}

            {/* Edit/Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">{editingId ? 'Sửa thể loại' : 'Thêm thể loại'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên thể loại *</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ name: e.target.value })}
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Tiểu thuyết, Văn học, Kỹ năng..." />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Hủy</button>
                            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {saving && <Loader2 size={16} className="animate-spin" />}
                                {editingId ? 'Cập nhật' : 'Thêm mới'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={20} />
                            </div>
                            <h3 className="font-semibold text-lg">Xác nhận xóa</h3>
                        </div>
                        <p className="text-slate-600 mb-6">
                            Bạn có chắc muốn xóa thể loại "<span className="font-medium text-slate-900">{deleteConfirm.name}</span>"?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Hủy</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
