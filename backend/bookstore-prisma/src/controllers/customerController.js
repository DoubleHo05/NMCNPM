const prisma = require('../utils/prisma');

// Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};

    if (search) {
      where.OR = [
        { tenKH: { contains: search } },
        { soDienThoai: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Get total count
    const total = await prisma.khachHang.count({ where });

    // Get customers
    const customers = await prisma.khachHang.findMany({
      where,
      skip,
      take,
      orderBy: {
        maKH: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách khách hàng',
    });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(id) },
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

// Create customer
const createCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, address } = req.body;

    // Validate required fields
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: 'Tên khách hàng là bắt buộc',
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại là bắt buộc',
      });
    }

    // Create customer
    const customer = await prisma.khachHang.create({
      data: {
        tenKH: fullName,
        soDienThoai: phone,
        email: email || null,
        diaChi: address || null,
        diemTichLuy: 0,
      },
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Tạo khách hàng thành công',
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo khách hàng',
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, phone, email, address } = req.body;

    // Check if customer exists
    const existingCustomer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(id) },
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    // Update customer
    const customer = await prisma.khachHang.update({
      where: { maKH: parseInt(id) },
      data: {
        tenKH: fullName || existingCustomer.tenKH,
        soDienThoai: phone || existingCustomer.soDienThoai,
        email: email !== undefined ? email : existingCustomer.email,
        diaChi: address !== undefined ? address : existingCustomer.diaChi,
      },
    });

    res.status(200).json({
      success: true,
      data: customer,
      message: 'Cập nhật khách hàng thành công',
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật khách hàng',
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if customer exists
    const customer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(id) },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    // Delete customer
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
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
