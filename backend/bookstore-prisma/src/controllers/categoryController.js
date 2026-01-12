const prisma = require('../utils/prisma');

// Lấy tất cả thể loại
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.theLoai.findMany({
      orderBy: {
        tenTheLoai: 'asc'
      }
    });

    res.json({
      success: true,
      data: categories.map(cat => ({
        id: String(cat.maTheLoai),
        name: cat.tenTheLoai
      }))
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thể loại',
      error: error.message
    });
  }
};

// Tạo thể loại mới
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên thể loại không được để trống'
      });
    }

    // Kiểm tra trùng tên
    const existing = await prisma.theLoai.findFirst({
      where: {
        tenTheLoai: name.trim()
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Thể loại này đã tồn tại'
      });
    }

    const newCategory = await prisma.theLoai.create({
      data: {
        tenTheLoai: name.trim()
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: String(newCategory.maTheLoai),
        name: newCategory.tenTheLoai
      },
      message: 'Tạo thể loại thành công'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo thể loại',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory
};
