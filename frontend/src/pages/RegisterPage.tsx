import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Briefcase, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        hoTen: '',
        tenDangNhap: '',
        email: '',
        matKhau: '',
        confirmPassword: '',
        vaiTro: 'THU_NGAN' // Default role
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const roles = [
        { value: 'THU_NGAN', label: 'Thu ngân' },
        { value: 'THU_KHO', label: 'Thủ kho' },
        { value: 'QUAN_LY', label: 'Quản lý' }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.matKhau !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        // Validate password length
        if (formData.matKhau.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tenDangNhap: formData.tenDangNhap,
                    matKhau: formData.matKhau,
                    hoTen: formData.hoTen,
                    email: formData.email || null,
                    vaiTro: formData.vaiTro
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            } else {
                setError(data.message || 'Đăng ký thất bại');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Họ tên */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên *</label>
                <div className="relative">
                    <input
                        type="text"
                        name="hoTen"
                        required
                        className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.hoTen}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        disabled={isLoading}
                    />
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                </div>
            </div>

            {/* Tên đăng nhập */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tên đăng nhập *</label>
                <div className="relative">
                    <input
                        type="text"
                        name="tenDangNhap"
                        required
                        className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.tenDangNhap}
                        onChange={handleChange}
                        placeholder="nguyenvana"
                        disabled={isLoading}
                    />
                    <User className="absolute left-3 top-3 text-slate-400" size={18} />
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                    <input
                        type="email"
                        name="email"
                        className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                </div>
            </div>

            {/* Vai trò */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vai trò *</label>
                <div className="relative">
                    <select
                        name="vaiTro"
                        required
                        className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                        value={formData.vaiTro}
                        onChange={handleChange}
                        disabled={isLoading}
                    >
                        {roles.map(role => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    <Briefcase className="absolute left-3 top-3 text-slate-400" size={18} />
                </div>
            </div>

            {/* Mật khẩu */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu *</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="matKhau"
                        required
                        className="w-full p-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.matKhau}
                        onChange={handleChange}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        disabled={isLoading}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu *</label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        required
                        className="w-full p-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        disabled={isLoading}
                    />
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        disabled={isLoading}
                    >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Đang đăng ký...
                    </>
                ) : (
                    'Tạo tài khoản'
                )}
            </button>

            <p className="text-center text-sm text-slate-500">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:underline">
                    Đăng nhập
                </Link>
            </p>
        </form>
    );
};

export default RegisterPage;
