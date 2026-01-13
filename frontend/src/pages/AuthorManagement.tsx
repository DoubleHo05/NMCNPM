import React, { useState, useEffect } from 'react';
import { UserCircle, Plus, Pencil, Trash2, X, Loader2, RefreshCw } from 'lucide-react';

interface Author {
    id: number;
    name: string;
    bookCount: number;
}

const API_URL = 'http://localhost:5000/api';

const AuthorManagement: React.FC = () => {
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchAuthors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/authors`);
            const data = await res.json();
            if (data.success) setAuthors(data.data);
        } catch (err) {
            console.error('Error fetching authors:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchAuthors(); }, []);

    const openModal = (author?: Author) => {
        if (author) {
            setEditingId(author.id);
            setFormData({ name: author.name });
        } else {
            setEditingId(null);
            setFormData({ name: '' });
        }
        setShowModal(true);
        setError('');
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Tên tác giả là bắt buộc');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const url = editingId ? `${API_URL}/authors/${editingId}` : `${API_URL}/authors`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setShowModal(false);
                fetchAuthors();
            } else {
                setError(data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Không thể kết nối server');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string, bookCount: number) => {
        if (bookCount > 0) {
            alert(`Không thể xóa "${name}" vì có ${bookCount} sách liên quan`);
            return;
        }
        if (!confirm(`Xác nhận xóa "${name}"?`)) return;

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/authors/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchAuthors();
            else alert(data.message);
        } catch (err) {
            alert('Lỗi khi xóa');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <UserCircle size={24} /> Quản lý Tác giả
                    </h2>
                    <p className="text-sm text-slate-500">Thêm, sửa, xóa tác giả</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchAuthors} className="p-2 border rounded-lg hover:bg-slate-50">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus size={18} /> Thêm tác giả
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {authors.map(a => (
                        <div key={a.id} className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                        <UserCircle size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">{a.name}</h4>
                                        <p className="text-sm text-slate-500">{a.bookCount} sách</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => openModal(a)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                                    <button onClick={() => handleDelete(a.id, a.name, a.bookCount)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {authors.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-500">Chưa có tác giả nào</div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">{editingId ? 'Sửa tác giả' : 'Thêm tác giả'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                        <div>
                            <label className="block text-sm font-medium mb-1">Tên tác giả *</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({ name: e.target.value })}
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nguyễn Nhật Ánh" />
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
        </div>
    );
};

export default AuthorManagement;
