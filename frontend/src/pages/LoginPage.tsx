import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@bookstore.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would perform API validation here.
    // For this demo, we'll just call the onLogin callback to simulate success.
    console.log('Logging in with:', { email, password });
    onLogin();
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="flex justify-between items-baseline">
            <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
            <Link to="/forgot-password" className="text-xs font-medium text-blue-600 hover:underline">
                Quên mật khẩu?
            </Link>
        </div>
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
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/30"
      >
        Đăng nhập
      </button>

      <p className="text-center text-sm text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
};

export default LoginPage;
