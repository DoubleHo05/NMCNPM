import React, { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, X, Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '../components/Toast';

interface Publisher {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    bookCount: number;
}

const API_URL = 'http://localhost:5000/api';

const PublisherManagement: React.FC = () => {
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    const fetchPublishers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/publishers`);
            const data = await res.json();
            if (data.success) setPublishers(data.data);
        } catch (err) {
            console.error('Error fetching publishers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchPublishers(); }, []);

    const openModal = (publisher?: Publisher) => {
        if (publisher) {
            setEditingId(publisher.id);
            setFormData({ name: publisher.name, address: publisher.address || '', phone: publisher.phone || '' });
        } else {
            setEditingId(null);
            setFormData({ name: '', address: '', phone: '' });
        }
        setShowModal(true);
        setError('');
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            setError('Tên NXB là bắt buộc');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('accessToken');
            const url = editingId ? `${API_URL}/publishers/${editingId}` : `${API_URL}/publishers`;
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                setShowModal(false);
                fetchPublishers();
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
            showToast(`Không thể xóa "${name}" vì có ${bookCount} sách liên quan`, 'error');
            return;
        }
        if (!confirm(`Xác nhận xóa "${name}"?`)) return;

        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`${API_URL}/publishers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) fetchPublishers();
            else showToast(data.message, 'error');
        } catch (err) {
            showToast('Lỗi khi xóa', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 size={24} /> Quản lý Nhà xuất bản
                    </h2>
                    <p className="text-sm text-slate-500">Thêm, sửa, xóa nhà xuất bản</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchPublishers} className="p-2 border rounded-lg hover:bg-slate-50">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus size={18} /> Thêm NXB
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
            ) : (
                <div className="bg-white rounded-xl border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="text-left text-sm text-slate-600">
                                <th className="px-4 py-3 font-medium">ID</th>
                                <th className="px-4 py-3 font-medium">Tên NXB</th>
                                <th className="px-4 py-3 font-medium">Địa chỉ</th>
                                <th className="px-4 py-3 font-medium">Điện thoại</th>
                                <th className="px-4 py-3 font-medium text-center">Số sách</th>
                                <th className="px-4 py-3 font-medium text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publishers.map(p => (
                                <tr key={p.id} className="border-t hover:bg-slate-50">
                                    <td className="px-4 py-3 text-sm">{p.id}</td>
                                    <td className="px-4 py-3 text-sm font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{p.address || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{p.phone || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center">{p.bookCount}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => openModal(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(p.id, p.name, p.bookCount)} className="p-1 text-red-600 hover:bg-red-50 rounded ml-1"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {publishers.length === 0 && (
                                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Chưa có nhà xuất bản nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">{editingId ? 'Sửa NXB' : 'Thêm NXB'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tên NXB *</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="NXB Trẻ" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                                <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="161B Lý Chính Thắng, Q.3, TP.HCM" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Điện thoại</label>
                                <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="028 3930 5959" />
                            </div>
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

export default PublisherManagement;
