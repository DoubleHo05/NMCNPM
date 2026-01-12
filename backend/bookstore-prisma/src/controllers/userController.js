const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

// Get all users với pagination, filter, search
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      vaiTro = '',
      trangThai = '',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { hoTen: { contains: search } },
        { tenDangNhap: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (vaiTro) {
      where.vaiTro = vaiTro;
    }

    if (trangThai !== '') {
      where.trangThai = trangThai === 'true';
    }

    // Get total count
    const total = await prisma.nhanVien.count({ where });

    // Get users
    const users = await prisma.nhanVien.findMany({
      where,
      skip,
      take,
      select: {
        maNV: true,
        tenDangNhap: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        vaiTro: true,
        trangThai: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / take),
          totalItems: total,
          itemsPerPage: take,
        },
      },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách nhân viên',
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.nhanVien.findUnique({
      where: { maNV: parseInt(id) },
      select: {
        maNV: true,
        tenDangNhap: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        vaiTro: true,
        trangThai: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin nhân viên',
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { tenDangNhap, matKhau, hoTen, email, soDienThoai, vaiTro, trangThai } = req.body;

    // Validation
    if (!tenDangNhap || !matKhau || !hoTen || !vaiTro) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc',
      });
    }

    // Check if username exists (chỉ check user đang active)
    const existingUser = await prisma.nhanVien.findFirst({
      where: { 
        tenDangNhap,
        trangThai: true
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại',
      });
    }

    // Check if email exists
    if (email) {
      const existingEmail = await prisma.nhanVien.findFirst({
        where: { 
          email,
          email: { not: null }
        },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng',
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // Create user
    const newUser = await prisma.nhanVien.create({
      data: {
        tenDangNhap,
        matKhau: hashedPassword,
        hoTen,
        email: email || null,
        soDienThoai: soDienThoai || null,
        vaiTro,
        trangThai: trangThai !== undefined ? trangThai : true,
      },
      select: {
        maNV: true,
        tenDangNhap: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        vaiTro: true,
        trangThai: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thêm nhân viên thành công',
      data: { user: newUser },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo nhân viên',
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenDangNhap, matKhau, hoTen, email, soDienThoai, vaiTro, trangThai } = req.body;

    // Check if user exists
    const existingUser = await prisma.nhanVien.findUnique({
      where: { maNV: parseInt(id) },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên',
      });
    }

    // Check if new username is taken by another user (chỉ check user active)
    if (tenDangNhap && tenDangNhap !== existingUser.tenDangNhap) {
      const userWithSameUsername = await prisma.nhanVien.findFirst({
        where: { 
          tenDangNhap,
          trangThai: true,
          maNV: { not: parseInt(id) }
        },
      });

      if (userWithSameUsername) {
        return res.status(400).json({
          success: false,
          message: 'Tên đăng nhập đã tồn tại',
        });
      }
    }

    // Check if new email is taken by another user
    if (email && email !== existingUser.email) {
      const userWithSameEmail = await prisma.nhanVien.findFirst({
        where: { 
          email,
          maNV: { not: parseInt(id) }
        },
      });

      if (userWithSameEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng',
        });
      }
    }

    // Prepare update data
    const updateData = {
      ...(hoTen && { hoTen }),
      ...(tenDangNhap && { tenDangNhap }),
      ...(email !== undefined && { email: email || null }),
      ...(soDienThoai !== undefined && { soDienThoai: soDienThoai || null }),
      ...(vaiTro && { vaiTro }),
      ...(trangThai !== undefined && { trangThai }),
    };

    // Hash new password if provided
    if (matKhau) {
      updateData.matKhau = await bcrypt.hash(matKhau, 10);
    }

    // Update user
    const updatedUser = await prisma.nhanVien.update({
      where: { maNV: parseInt(id) },
      data: updateData,
      select: {
        maNV: true,
        tenDangNhap: true,
        hoTen: true,
        email: true,
        soDienThoai: true,
        vaiTro: true,
        trangThai: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin nhân viên thành công',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật nhân viên',
    });
  }
};

// Delete user (soft delete by setting trangThai = false)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await prisma.nhanVien.findUnique({
      where: { maNV: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên',
      });
    }

    // Prevent deleting yourself (chỉ check khi có req.user)
    if (req.user && user.maNV === req.user.maNV) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính bạn',
      });
    }

    // Soft delete by setting trangThai to false and rename username to avoid unique constraint
    const deletedUsername = `${user.tenDangNhap}_deleted_${Date.now()}`;
    const deletedEmail = user.email ? `${user.email}_deleted_${Date.now()}` : null;
    
    await prisma.nhanVien.update({
      where: { maNV: parseInt(id) },
      data: { 
        trangThai: false,
        tenDangNhap: deletedUsername,
        email: deletedEmail
      },
    });

    res.status(200).json({
      success: true,
      message: 'Xóa nhân viên thành công',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa nhân viên',
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trangThai } = req.body;

    if (trangThai === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp trạng thái',
      });
    }

    const user = await prisma.nhanVien.findUnique({
      where: { maNV: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên',
      });
    }

    // Prevent disabling yourself
    if (user.maNV === req.user.maNV && !trangThai) {
      return res.status(400).json({
        success: false,
        message: 'Không thể vô hiệu hóa tài khoản của chính bạn',
      });
    }

    const updatedUser = await prisma.nhanVien.update({
      where: { maNV: parseInt(id) },
      data: { trangThai },
      select: {
        maNV: true,
        hoTen: true,
        trangThai: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `${trangThai ? 'Kích hoạt' : 'Vô hiệu hóa'} tài khoản thành công`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái',
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
};
