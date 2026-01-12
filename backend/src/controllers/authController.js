const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const login = async (req, res) => {
  try {
    const { tenDangNhap, matKhau } = req.body;

    if (!tenDangNhap || !matKhau) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      });
    }

    const user = await prisma.nhanVien.findUnique({
      where: { tenDangNhap },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
    }

    if (!user.trangThai) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa',
      });
    }

    const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
    }

    const payload = {
      maNV: user.maNV,
      tenDangNhap: user.tenDangNhap,
      vaiTro: user.vaiTro,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          maNV: user.maNV,
          tenDangNhap: user.tenDangNhap,
          hoTen: user.hoTen,
          vaiTro: user.vaiTro,
          trangThai: user.trangThai,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy refresh token',
      });
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token không hợp lệ hoặc đã hết hạn',
      });
    }

    const user = await prisma.nhanVien.findUnique({
      where: { maNV: decoded.maNV },
    });

    if (!user || !user.trangThai) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa',
      });
    }

    const payload = {
      maNV: user.maNV,
      tenDangNhap: user.tenDangNhap,
      vaiTro: user.vaiTro,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi làm mới token',
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.nhanVien.findUnique({
      where: { maNV: req.user.maNV },
      select: {
        maNV: true,
        tenDangNhap: true,
        hoTen: true,
        vaiTro: true,
        trangThai: true
      },
    });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin người dùng',
    });
  }
};

const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công',
  });
};

module.exports = {
  login,
  refreshToken,
  getCurrentUser,
  logout,
};
