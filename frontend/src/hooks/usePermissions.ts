import { useAuth } from '../context/AuthContext';

export type Permission = 
  | 'book.view'      // Xem sách
  | 'book.create'    // Thêm sách
  | 'book.edit'      // Sửa sách
  | 'book.delete'    // Xóa sách
  | 'book.import'    // Nhập sách (BM1) - THU_KHO
  | 'invoice.view'   // Xem hóa đơn
  | 'invoice.create' // Tạo hóa đơn bán sách (BM2) - THU_NGAN
  | 'payment.create' // Thu tiền (BM4) - THU_NGAN
  | 'report.view'    // Xem báo cáo (BM5)
  | 'settings.edit'  // Sửa quy định (QĐ6)
  | 'user.manage';   // Quản lý nhân viên

// Permission rules based on roles
const rolePermissions: Record<string, Permission[]> = {
  QUAN_LY: [
    'book.view',
    'book.create',
    'book.edit',
    'book.delete',
    'book.import',
    'invoice.view',
    'invoice.create',
    'payment.create',
    'report.view',
    'settings.edit',
    'user.manage',
  ],
  THU_KHO: [
    'book.view',
    'book.import', // Chỉ được nhập sách
    'report.view',
  ],
  THU_NGAN: [
    'book.view',
    'invoice.view',
    'invoice.create', // Chỉ được bán sách
    'payment.create', // Chỉ được thu tiền
    'report.view',
  ],
};

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.vaiTro] || [];
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(p => hasPermission(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(p => hasPermission(p));
  };

  const canImportBooks = hasPermission('book.import');
  const canCreateInvoice = hasPermission('invoice.create');
  const canCollectPayment = hasPermission('payment.create');
  const canManageBooks = hasPermission('book.create') && hasPermission('book.edit');
  const canManageUsers = hasPermission('user.manage');
  const canEditSettings = hasPermission('settings.edit');

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canImportBooks,
    canCreateInvoice,
    canCollectPayment,
    canManageBooks,
    canManageUsers,
    canEditSettings,
    userRole: user?.vaiTro,
  };
};
