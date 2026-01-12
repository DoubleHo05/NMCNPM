const prisma = require('../config/database');

// Lấy tất cả khách hàng
const getAllCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { tenKH: { contains: search } },
        { soDienThoai: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [customers, total] = await Promise.all([
      prisma.khachHang.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { maKH: 'desc' },
      }),
      prisma.khachHang.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách khách hàng',
    });
  }
};

// Lấy khách hàng theo ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const customer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(id) },
      include: {
        hoadon: {
          orderBy: { ngayLap: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin khách hàng',
    });
  }
};

// Tìm khách hàng theo số điện thoại
const getCustomerByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    
    const customer = await prisma.khachHang.findFirst({
      where: { soDienThoai: phone },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng với số điện thoại này',
      });
    }

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Get customer by phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm khách hàng',
    });
  }
};

// Tạo khách hàng mới
const createCustomer = async (req, res) => {
  try {
    const { tenKH, soDienThoai, email, diaChi } = req.body;

    // Kiểm tra số điện thoại đã tồn tại chưa
    if (soDienThoai) {
      const existingCustomer = await prisma.khachHang.findFirst({
        where: { soDienThoai },
      });
      
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Số điện thoại đã được đăng ký cho khách hàng khác',
        });
      }
    }

    const customer = await prisma.khachHang.create({
      data: {
        tenKH,
        soDienThoai,
        email,
        diaChi,
        diemTichLuy: 0,
        congNo: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo khách hàng thành công',
      data: customer,
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo khách hàng',
    });
  }
};

// Cập nhật khách hàng
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenKH, soDienThoai, email, diaChi, diemTichLuy } = req.body;

    const customer = await prisma.khachHang.update({
      where: { maKH: parseInt(id) },
      data: {
        tenKH,
        soDienThoai,
        email,
        diaChi,
        diemTichLuy: diemTichLuy !== undefined ? parseInt(diemTichLuy) : undefined,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật khách hàng thành công',
      data: customer,
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật khách hàng',
    });
  }
};

// Xóa khách hàng
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Kiểm tra có hóa đơn liên quan không
    const invoiceCount = await prisma.hoaDonBanSach.count({
      where: { maKH: parseInt(id) },
    });

    if (invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa khách hàng đã có hóa đơn',
      });
    }

    await prisma.khachHang.delete({
      where: { maKH: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Xóa khách hàng thành công',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa khách hàng',
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
