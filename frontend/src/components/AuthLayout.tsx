import React from 'react';

const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
            <div className="mx-auto w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4">
                BS
            </div>
            <h1 className="font-bold text-slate-900 text-3xl">Chào mừng trở lại!</h1>
            <p className="text-slate-500 mt-2">Đăng nhập để tiếp tục quản lý nhà sách của bạn.</p>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            {children}
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
