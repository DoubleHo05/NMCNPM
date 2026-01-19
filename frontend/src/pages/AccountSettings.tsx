import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  User, Shield, Bell, Camera, Mail, Phone,
  Upload, Eye, EyeOff, CheckCircle, Image as ImageIcon, AlertCircle, X,
  FilePlus, FileText, DollarSign, Cog, Loader2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { updateCurrentUserProfile, changePassword as changePasswordApi } from '../services/userService';
import { timeAgo } from '../utils/time';

type Tab = 'profile' | 'security' | 'notification';

const AccountSettings: React.FC = () => {
  const { notifications } = useStore();
  const { user, refreshUser } = useAuth();

  // Use URL params for Tab management instead of simple useState
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') as Tab;

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Sync internal state with URL params
  useEffect(() => {
    if (currentTab && ['profile', 'security', 'notification'].includes(currentTab)) {
      setActiveTab(currentTab);
    } else {
      setActiveTab('profile');
    }
  }, [currentTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Helper to get initials for avatar
  const getInitials = (fullName: string | undefined) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(' ').filter(p => p);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // -- STATE: PROFILE --
  const [profile, setProfile] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    avatar: ''
  });

  // Loading and message states
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Initialize profile from user data
  useEffect(() => {
    if (user) {
      const initials = getInitials(user.hoTen);
      setProfile({
        hoTen: user.hoTen || '',
        email: user.email || '',
        soDienThoai: user.soDienThoai || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D8ABC&color=fff`
      });
    }
  }, [user]);

  // -- STATE: AVATAR MODAL --
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- STATE: SECURITY --
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // -- HANDLERS: AVATAR --
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewAvatar(url);
    }
  };

  const handleSaveAvatar = () => {
    if (previewAvatar) {
      setProfile(prev => ({ ...prev, avatar: previewAvatar }));
      setIsAvatarModalOpen(false);
      setPreviewAvatar(null);
    }
  };

  const handleCloseAvatarModal = () => {
    setIsAvatarModalOpen(false);
    setPreviewAvatar(null);
  };

  // -- HANDLERS: PROFILE FORM --
  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // -- HANDLERS: PROFILE UPDATE --
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setProfileError(null);
    setProfileSuccess(null);
    setIsProfileLoading(true);

    try {
      const response = await updateCurrentUserProfile({
        hoTen: profile.hoTen,
        email: profile.email || undefined,
        soDienThoai: profile.soDienThoai || undefined,
      });

      if (response.success) {
        setProfileSuccess('Cập nhật thông tin thành công!');
        // Refresh user data in AuthContext
        await refreshUser();
      } else {
        setProfileError(response.message || 'Cập nhật thất bại');
      }
    } catch (error) {
      setProfileError('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleCancelProfileEdit = () => {
    // Reset to original user data
    if (user) {
      const initials = getInitials(user.hoTen);
      setProfile({
        hoTen: user.hoTen || '',
        email: user.email || '',
        soDienThoai: user.soDienThoai || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D8ABC&color=fff`
      });
    }
    setProfileError(null);
    setProfileSuccess(null);
  };

  // -- HANDLERS: PASSWORD --
  // Real-time checks
  const isLengthValid = passwords.new.length >= 8;
  const isCaseValid = /[a-z]/.test(passwords.new) && /[A-Z]/.test(passwords.new);
  const isSpecialValid = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new);

  const handleUpdatePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    // 1. Check Empty
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordError("Vui lòng nhập đầy đủ các trường mật khẩu.");
      return;
    }

    // 2. Check Match
    if (passwords.new !== passwords.confirm) {
      setPasswordError("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    // 3. Check Complexity
    if (!isLengthValid || !isCaseValid || !isSpecialValid) {
      setPasswordError("Mật khẩu mới chưa đáp ứng đủ yêu cầu bảo mật.");
      return;
    }

    // 4. Logic check (optional): New shouldn't be Old
    if (passwords.new === passwords.current) {
      setPasswordError("Mật khẩu mới không được trùng với mật khẩu cũ.");
      return;
    }

    setIsPasswordLoading(true);

    try {
      const response = await changePasswordApi(passwords.current, passwords.new);
      
      if (response.success) {
        setPasswordSuccess("Đổi mật khẩu thành công!");
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        setPasswordError(response.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      setPasswordError("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const notificationIcons = {
    import: <FilePlus className="text-blue-500" size={24} />,
    invoice: <FileText className="text-green-500" size={24} />,
    payment: <DollarSign className="text-purple-500" size={24} />,
    settings: <Cog className="text-amber-500" size={24} />,
    info: <Bell className="text-slate-500" size={24} />,
  };

  return (
    <div className="space-y-4 pb-10">

      {/* 1. Header & Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Tài khoản & Cài đặt</h2>
          <div className="text-sm text-slate-500 mt-1">
            Quản lý thông tin cá nhân, bảo mật và tùy chọn thông báo.
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2
               ${activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <User size={18} />
            Tài khoản
          </button>
          <button
            onClick={() => handleTabChange('security')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2
               ${activeTab === 'security'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Shield size={18} />
            Bảo mật
          </button>
          <button
            onClick={() => handleTabChange('notification')}
            className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2
               ${activeTab === 'notification'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Bell size={18} />
            Thông báo
          </button>
        </div>
      </div>

      {/* 2. Content Sections */}

      {/* --- TAB: PROFILE --- */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

          {/* Profile Information Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Thông tin cá nhân</h3>

            {/* Profile Notifications */}
            {profileError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">{profileSuccess}</span>
              </div>
            )}

            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md">
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {/* Hover Overlay */}
                <div
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="text-white" size={24} />
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  Thay đổi ảnh
                  <Camera size={16} />
                </button>
                <p className="text-xs text-slate-400 mt-2">
                  Avatar được tạo tự động từ tên
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={profile.hoTen}
                  onChange={(e) => handleProfileChange('hoTen', e.target.value)}
                  placeholder="Nhập họ và tên..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="email"
                    className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    placeholder="Nhập email..."
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Số điện thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="tel"
                    className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={profile.soDienThoai}
                    onChange={(e) => handleProfileChange('soDienThoai', e.target.value)}
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên đăng nhập</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  value={user?.tenDangNhap || ''}
                  disabled
                />
                <p className="text-xs text-slate-400 mt-1">Không thể thay đổi tên đăng nhập</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Vai trò</label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  value={user?.vaiTro === 'QUAN_LY' ? 'Quản lý' : user?.vaiTro === 'THU_KHO' ? 'Thủ kho' : 'Thu ngân'}
                  disabled
                />
              </div>
            </div>

            <div className="mt-8 pt-6 flex items-center gap-4 border-t border-slate-100">
              <button 
                onClick={handleUpdateProfile}
                disabled={isProfileLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProfileLoading && <Loader2 size={16} className="animate-spin" />}
                Cập nhật
              </button>
              <button 
                onClick={handleCancelProfileEdit}
                disabled={isProfileLoading}
                className="px-6 py-2.5 text-slate-600 hover:text-red-600 font-medium text-sm transition-colors disabled:opacity-50"
              >
                Huỷ bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: SECURITY --- */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Đổi mật khẩu</h3>

            {/* Notifications */}
            {passwordError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
                <CheckCircle size={20} />
                <span className="text-sm font-medium">{passwordSuccess}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu cũ</label>
                <div className="relative">
                  <input
                    type={showPass.current ? "text" : "password"}
                    className="w-full p-3 pr-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nhập mật khẩu cũ..."
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                  <button
                    onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPass.new ? "text" : "password"}
                    className={`w-full p-3 pr-10 bg-white border rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none
                                ${passwordError && !isLengthValid ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="Nhập mật khẩu mới..."
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                  <button
                    onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPass.confirm ? "text" : "password"}
                    className={`w-full p-3 pr-10 bg-white border rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none
                                ${passwords.confirm && passwords.new !== passwords.confirm ? 'border-red-300' : 'border-slate-200'}`}
                    placeholder="Nhập lại mật khẩu mới..."
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                  <button
                    onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-xs text-red-500 mt-1">Mật khẩu không khớp!</p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-slate-700">Yêu cầu mật khẩu mới:</p>
              <div className={`flex items-center gap-2 text-xs transition-colors ${isLengthValid ? 'text-green-600' : 'text-slate-500'}`}>
                <CheckCircle size={14} className={isLengthValid ? 'text-green-500' : 'text-slate-300'} />
                Có ít nhất 8 kí tự
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors ${isCaseValid ? 'text-green-600' : 'text-slate-500'}`}>
                <CheckCircle size={14} className={isCaseValid ? 'text-green-500' : 'text-slate-300'} />
                Kết hợp giữa chữ thường và hoa
              </div>
              <div className={`flex items-center gap-2 text-xs transition-colors ${isSpecialValid ? 'text-green-600' : 'text-slate-500'}`}>
                <CheckCircle size={14} className={isSpecialValid ? 'text-green-500' : 'text-slate-300'} />
                Có sử dụng kí tự đặc biệt (VD: !@#...)
              </div>
            </div>

            <div className="mt-8 pt-6 flex items-center gap-4 border-t border-slate-100">
              <button
                onClick={handleUpdatePassword}
                disabled={isPasswordLoading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isPasswordLoading && <Loader2 size={16} className="animate-spin" />}
                Thay đổi mật khẩu
              </button>
              <button
                onClick={() => {
                  setPasswords({ current: '', new: '', confirm: '' });
                  setPasswordError(null);
                  setPasswordSuccess(null);
                }}
                className="px-6 py-2.5 text-blue-600 hover:underline font-medium text-sm transition-colors"
              >
                Huỷ bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: NOTIFICATIONS --- */}
      {activeTab === 'notification' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          {notifications.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {notifications.map(notif => (
                <div key={notif.id} className="flex items-start gap-4 p-6 hover:bg-slate-50/50">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-1">
                    {notificationIcons[notif.type]}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-slate-800">{notif.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{timeAgo(notif.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Bạn hiện không có thông báo nào</h3>
              <p className="text-slate-400 mt-2 text-sm max-w-xs text-center">
                Chúng tôi sẽ thông báo cho bạn khi có cập nhật quan trọng về tài khoản hoặc hệ thống.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- FACEBOOK STYLE AVATAR MODAL --- */}
      {isAvatarModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[500px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 mx-4">

            {/* Header */}
            <div className="relative py-4 border-b border-slate-200">
              <h3 className="text-center text-lg font-bold text-slate-900">Cập nhật ảnh đại diện</h3>
              <button
                onClick={handleCloseAvatarModal}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {!previewAvatar ? (
                <div className="space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload size={18} />
                    Tải ảnh lên
                  </button>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {/* Simple frame placeholders to look like Facebook suggestions */}
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200">
                      <ImageIcon className="text-slate-400" size={32} />
                    </div>
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-200">
                      <ImageIcon className="text-slate-400" size={32} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-slate-100 shadow-inner mb-6 relative group">
                    <img src={previewAvatar} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="w-full flex items-center justify-center gap-4">
                    <p className="text-sm text-slate-500">Kéo để điều chỉnh (Mô phỏng)</p>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={handleCloseAvatarModal}
                className="px-5 py-2 text-blue-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveAvatar}
                disabled={!previewAvatar}
                className="px-8 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default AccountSettings;