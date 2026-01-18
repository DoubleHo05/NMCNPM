import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const ChangePassword: React.FC = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            setError('Mật khẩu mới phải khác mật khẩu hiện tại');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/users/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setError(data.message || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePassword = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Đổi mật khẩu</h2>
                        <p className="text-sm text-slate-500">Cập nhật mật khẩu tài khoản của bạn</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                        <CheckCircle size={20} />
                        <span>Đổi mật khẩu thành công!</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu hiện tại</label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={formData.currentPassword}
                                onChange={e => handleChange('currentPassword', e.target.value)}
                                className="w-full p-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <button
                                type="button"
                                onClick={() => togglePassword('current')}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={e => handleChange('newPassword', e.target.value)}
                                className="w-full p-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <button
                                type="button"
                                onClick={() => togglePassword('new')}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Ít nhất 6 ký tự</p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={e => handleChange('confirmPassword', e.target.value)}
                                className="w-full p-3 pl-10 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <button
                                type="button"
                                onClick={() => togglePassword('confirm')}
                                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                            >
                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Đang xử lý...
                            </>
                        ) : (
                            'Đổi mật khẩu'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
