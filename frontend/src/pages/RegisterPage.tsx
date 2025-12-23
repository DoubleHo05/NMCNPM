import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const RegisterPage: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }
        // Simulate registration success
        console.log('Registering with:', { name, email, password });
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên</label>
                <div className="relative">
                <input
                    type="text"
                    required
                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                />
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <div className="relative">
                <input
                    type="email"
                    required
                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                />
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                </div>
            </div>

            <div>
                {/* FIX: Corrected typo in closing tag from </hlabel> to </label> */}
                <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
                <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full p-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="w-full p-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                </div>
            </div>

            <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30"
            >
                Tạo tài khoản
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
