const prisma = require('../config/database');

// Lấy tất cả quy định
const getAllRules = async (req, res) => {
  try {
    const rules = await prisma.quyDinh.findMany({
      orderBy: { tenQuyDinh: 'asc' },
    });

    // Transform thành object key-value để dễ sử dụng
    const rulesObject = {};
    rules.forEach(rule => {
      rulesObject[rule.tenQuyDinh] = rule.giaTri;
    });

    res.status(200).json({
      success: true,
      data: {
        rules,
        rulesObject,
      },
    });
  } catch (error) {
    console.error('Get all rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách quy định',
    });
  }
};

// Lấy quy định theo tên
const getRuleByName = async (req, res) => {
  try {
    const { name } = req.params;
    
    const rule = await prisma.quyDinh.findFirst({
      where: { tenQuyDinh: name },
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quy định',
      });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    console.error('Get rule by name error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy quy định',
    });
  }
};

// Cập nhật quy định
const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { giaTri } = req.body;

    const rule = await prisma.quyDinh.update({
      where: { maQuyDinh: parseInt(id) },
      data: { giaTri },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật quy định thành công',
      data: rule,
    });
  } catch (error) {
    console.error('Update rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật quy định',
    });
  }
};

// Tạo quy định mới
const createRule = async (req, res) => {
  try {
    const { tenQuyDinh, giaTri } = req.body;

    // Kiểm tra quy định đã tồn tại
    const existingRule = await prisma.quyDinh.findFirst({
      where: { tenQuyDinh },
    });

    if (existingRule) {
      return res.status(400).json({
        success: false,
        message: 'Quy định với tên này đã tồn tại',
      });
    }

    const rule = await prisma.quyDinh.create({
      data: { tenQuyDinh, giaTri },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo quy định thành công',
      data: rule,
    });
  } catch (error) {
    console.error('Create rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo quy định',
    });
  }
};

// Xóa quy định
const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.quyDinh.delete({
      where: { maQuyDinh: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Xóa quy định thành công',
    });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa quy định',
    });
  }
};

module.exports = {
  getAllRules,
  getRuleByName,
  updateRule,
  createRule,
  deleteRule,
};
