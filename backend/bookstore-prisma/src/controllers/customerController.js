const prisma = require('../utils/prisma');

// Lấy tất cả khách hàng
const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.khachHang.findMany({
      orderBy: {
        maKH: 'desc',
      },
    });

    // Transform data cho frontend
    const transformedCustomers = customers.map((customer) => ({
      id: customer.maKH.toString(),
      name: customer.tenKH || 'Khách hàng',
      phone: customer.soDienThoai || '',
      email: customer.email || '',
      address: '', // Database không có trường này
      currentDebt: 0, // Sẽ tính từ hóa đơn sau
      loyaltyPoints: customer.diemTichLuy || 0,
    }));

    res.json({
      success: true,
      data: transformedCustomers,
      message: 'Lấy danh sách khách hàng thành công',
    });
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khách hàng',
      error: error.message,
    });
  }
};

// Lấy chi tiết một khách hàng
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(id) },
      include: {
        hoadon: {
          orderBy: { ngayBan: 'desc' },
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

    const transformedCustomer = {
      id: customer.maKH.toString(),
      name: customer.tenKH || 'Khách hàng',
      phone: customer.soDienThoai || '',
      email: customer.email || '',
      address: '',
      currentDebt: 0,
      loyaltyPoints: customer.diemTichLuy || 0,
      invoices: customer.hoadon.map(inv => ({
        id: inv.maHoaDon.toString(),
        date: inv.ngayBan,
        total: parseFloat(inv.tongTien) || 0,
      })),
    };

    res.json({
      success: true,
      data: transformedCustomer,
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin khách hàng',
      error: error.message,
    });
  }
};

// Thêm khách hàng mới
const createCustomer = async (req, res) => {
  try {
    const { tenKH, soDienThoai, email } = req.body;

    // Validate required fields
    if (!tenKH) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền tên khách hàng',
      });
    }

    const newCustomer = await prisma.khachHang.create({
      data: {
        tenKH,
        soDienThoai,
        email,
        diemTichLuy: 0,
      },
    });

    const transformedCustomer = {
      id: newCustomer.maKH.toString(),
      name: newCustomer.tenKH,
      phone: newCustomer.soDienThoai || '',
      email: newCustomer.email || '',
      address: '',
      currentDebt: 0,
      loyaltyPoints: 0,
    };

    res.status(201).json({
      success: true,
      data: transformedCustomer,
      message: 'Thêm khách hàng thành công',
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm khách hàng',
      error: error.message,
    });
  }
};

// Cập nhật khách hàng
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenKH, soDienThoai, email, diemTichLuy } = req.body;

    const existingCustomer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    const updatedCustomer = await prisma.khachHang.update({
      where: { maKH: parseInt(id) },
      data: {
        tenKH: tenKH !== undefined ? tenKH : existingCustomer.tenKH,
        soDienThoai: soDienThoai !== undefined ? soDienThoai : existingCustomer.soDienThoai,
        email: email !== undefined ? email : existingCustomer.email,
        diemTichLuy: diemTichLuy !== undefined ? parseInt(diemTichLuy) : existingCustomer.diemTichLuy,
      },
    });

    const transformedCustomer = {
      id: updatedCustomer.maKH.toString(),
      name: updatedCustomer.tenKH,
      phone: updatedCustomer.soDienThoai || '',
      email: updatedCustomer.email || '',
      address: '',
      currentDebt: 0,
      loyaltyPoints: updatedCustomer.diemTichLuy || 0,
    };

    res.json({
      success: true,
      data: transformedCustomer,
      message: 'Cập nhật khách hàng thành công',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật khách hàng',
      error: error.message,
    });
  }
};

// Xóa khách hàng
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCustomer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(id) },
      include: { hoadon: true },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    // Kiểm tra xem khách hàng có hóa đơn không
    if (existingCustomer.hoadon.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa khách hàng đã có lịch sử mua hàng',
      });
    }

    await prisma.khachHang.delete({
      where: { maKH: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Xóa khách hàng thành công',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa khách hàng',
      error: error.message,
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
