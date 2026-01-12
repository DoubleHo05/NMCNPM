const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    const user = await prisma.nhanVien.findUnique({
      where: { maNV: decoded.maNV },
      select: {
        maNV: true,
        tenDangNhap: true,
        hoTen: true,
        vaiTro: true,
        trangThai: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Nhân viên không tồn tại',
      });
    }

    if (!user.trangThai) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
    });
  }
};

const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực',
      });
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập',
      });
    }

    next();
  };
};

module.exports = { authMiddleware, checkRole };
