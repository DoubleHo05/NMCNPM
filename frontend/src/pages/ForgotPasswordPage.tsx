import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../components/Toast';

const ForgotPasswordPage: React.FC = () => {
    const [step, setStep] = useState(1); // 1 for email, 2 for OTP and new password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate sending OTP
        console.log('Sending OTP to:', email);
        showToast(`Đã gửi mã OTP đến ${email}. Vui lòng kiểm tra hộp thư của bạn.`, 'success');
        setStep(2);
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast("Mật khẩu xác nhận không khớp!", 'error');
            return;
        }
        // Simulate password reset
        console.log('Resetting password for:', email, 'with new password:', newPassword);
        showToast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.', 'success');
        navigate('/login');
    };

    return (
        <div>
            {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                    <h2 className="text-xl font-bold text-center text-slate-800">Khôi phục mật khẩu</h2>
                    <p className="text-center text-sm text-slate-500">Nhập email của bạn để nhận mã OTP khôi phục.</p>
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
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30"
                    >
                        Gửi mã OTP
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <h2 className="text-xl font-bold text-center text-slate-800">Đặt lại mật khẩu</h2>
                    <p className="text-center text-sm text-slate-500">Một mã OTP đã được gửi đến <span className="font-bold">{email}</span>.</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mã OTP</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                maxLength={6}
                                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none tracking-[0.5em] text-center"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="••••••"
                            />
                            <Key className="absolute left-3 top-3 text-slate-400" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu mới</label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                required
                                className="w-full p-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        Đặt lại mật khẩu
                    </button>
                </form>
            )}
            <div className="text-center mt-6">
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline flex items-center justify-center gap-1">
                    <ArrowLeft size={16} /> Quay lại Đăng nhập
                </Link>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
