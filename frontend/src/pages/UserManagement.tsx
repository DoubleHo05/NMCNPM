import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  updateUserStatus,
  CreateUserInput,
  UpdateUserInput 
} from '../services/userService';
import { User } from '../services/authService';

// Role labels in Vietnamese
const roleLabels: Record<string, string> = {
  'QUAN_LY': 'Quản lý',
  'THU_KHO': 'Thủ kho',
  'THU_NGAN': 'Thu ngân'
};

const roleColors: Record<string, string> = {
  'QUAN_LY': 'bg-purple-100 text-purple-800',
  'THU_KHO': 'bg-blue-100 text-blue-800',
  'THU_NGAN': 'bg-green-100 text-green-800'
};

// Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// User form component
interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    tenDangNhap: user?.tenDangNhap || '',
    matKhau: '',
    hoTen: user?.hoTen || '',
    email: user?.email || '',
    soDienThoai: user?.soDienThoai || '',
    vaiTro: user?.vaiTro || 'THU_NGAN' as const,
    trangThai: user?.trangThai ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: CreateUserInput | UpdateUserInput = {
      ...formData,
      vaiTro: formData.vaiTro as 'QUAN_LY' | 'THU_KHO' | 'THU_NGAN'
    };
    // Don't send empty password on update
    if (user && !formData.matKhau) {
      delete (submitData as UpdateUserInput).matKhau;
    }
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tên đăng nhập <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.tenDangNhap}
          onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập tên đăng nhập"
          disabled={!!user}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mật khẩu {!user && <span className="text-red-500">*</span>}
        </label>
        <input
          type="password"
          required={!user}
          value={formData.matKhau}
          onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={user ? 'Để trống nếu không đổi' : 'Nhập mật khẩu'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Họ tên <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.hoTen}
          onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập họ tên"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
        <input
          type="tel"
          value={formData.soDienThoai}
          onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Nhập số điện thoại"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Vai trò <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.vaiTro}
          onChange={(e) => setFormData({ ...formData, vaiTro: e.target.value as 'QUAN_LY' | 'THU_KHO' | 'THU_NGAN' })}
          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="QUAN_LY">Quản lý</option>
          <option value="THU_KHO">Thủ kho</option>
          <option value="THU_NGAN">Thu ngân</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="trangThai"
          checked={formData.trangThai}
          onChange={(e) => setFormData({ ...formData, trangThai: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="trangThai" className="text-sm font-medium text-slate-700">
          Kích hoạt tài khoản
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          disabled={isLoading}
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Đang xử lý...
            </>
          ) : (
            user ? 'Cập nhật' : 'Thêm mới'
          )}
        </button>
      </div>
    </form>
  );
};

// Main component
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load users
  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAllUsers({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        vaiTro: filterRole,
        trangThai: filterStatus
      });
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      }
    } catch (err) {
      setError('Không thể tải danh sách nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, filterRole, filterStatus]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Handle create/update
  const handleSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    setIsSubmitting(true);
    setError('');
    try {
      if (editingUser) {
        await updateUser(editingUser.maNV, data);
        setSuccess('Cập nhật nhân viên thành công');
      } else {
        await createUser(data as CreateUserInput);
        setSuccess('Thêm nhân viên thành công');
      }
      setIsModalOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    try {
      await deleteUser(deleteConfirm.maNV);
      setSuccess('Xóa nhân viên thành công');
      setDeleteConfirm(null);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa nhân viên');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      await updateUserStatus(user.maNV, !user.trangThai);
      setSuccess(`Đã ${user.trangThai ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản`);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thay đổi trạng thái');
    }
  };

  // Open modal for create
  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý nhân viên</h1>
            <p className="text-sm text-slate-500">Tổng cộng {totalItems} nhân viên</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          <Plus size={20} />
          Thêm nhân viên
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên, username, email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => { setFilterRole(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="QUAN_LY">Quản lý</option>
            <option value="THU_KHO">Thủ kho</option>
            <option value="THU_NGAN">Thu ngân</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Đã vô hiệu</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>Không tìm thấy nhân viên nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Nhân viên</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Liên hệ</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Vai trò</th>
                <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Trạng thái</th>
                <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.maNV} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-900">{user.hoTen}</p>
                      <p className="text-sm text-slate-500">@{user.tenDangNhap}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-slate-900">{user.email || '-'}</p>
                      <p className="text-slate-500">{user.soDienThoai || '-'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.vaiTro]}`}>
                      {roleLabels[user.vaiTro]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className="flex items-center gap-1.5"
                    >
                      {user.trangThai ? (
                        <>
                          <ToggleRight className="text-green-600" size={24} />
                          <span className="text-sm text-green-600">Hoạt động</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="text-slate-400" size={24} />
                          <span className="text-sm text-slate-400">Vô hiệu</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-blue-600"
                        title="Sửa"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-red-600"
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        title={editingUser ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
      >
        <UserForm
          user={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => { setIsModalOpen(false); setEditingUser(null); }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Xác nhận xóa"
      >
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="text-red-600" size={24} />
          </div>
          <p className="text-slate-600 mb-6">
            Bạn có chắc muốn xóa nhân viên <strong>{deleteConfirm?.hoTen}</strong>?
            <br />
            <span className="text-sm text-slate-500">Hành động này không thể hoàn tác.</span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
