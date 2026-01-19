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

// Xóa thể loại
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const maTheLoai = parseInt(id);

    if (isNaN(maTheLoai)) {
      return res.status(400).json({
        success: false,
        message: 'ID thể loại không hợp lệ'
      });
    }

    // Kiểm tra thể loại có tồn tại không
    const category = await prisma.theLoai.findUnique({
      where: { maTheLoai }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }

    // Kiểm tra xem có sách nào đang sử dụng thể loại này không
    const booksUsingCategory = await prisma.sach.findMany({
      where: { maTheLoai }
    });

    if (booksUsingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa thể loại này vì có ${booksUsingCategory.length} sách đang sử dụng`
      });
    }

    // Xóa thể loại
    await prisma.theLoai.delete({
      where: { maTheLoai }
    });

    res.json({
      success: true,
      message: 'Xóa thể loại thành công'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thể loại',
      error: error.message
    });
  }
};

// Cập nhật thể loại
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const maTheLoai = parseInt(id);

    if (isNaN(maTheLoai)) {
      return res.status(400).json({
        success: false,
        message: 'ID thể loại không hợp lệ'
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên thể loại không được để trống'
      });
    }

    // Kiểm tra thể loại có tồn tại không
    const category = await prisma.theLoai.findUnique({
      where: { maTheLoai }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }

    // Kiểm tra tên mới có trùng với thể loại khác không
    const existingWithName = await prisma.theLoai.findFirst({
      where: {
        tenTheLoai: name.trim(),
        NOT: { maTheLoai }
      }
    });

    if (existingWithName) {
      return res.status(400).json({
        success: false,
        message: 'Tên thể loại này đã tồn tại'
      });
    }

    // Cập nhật thể loại
    const updatedCategory = await prisma.theLoai.update({
      where: { maTheLoai },
      data: { tenTheLoai: name.trim() }
    });

    res.json({
      success: true,
      data: {
        id: String(updatedCategory.maTheLoai),
        name: updatedCategory.tenTheLoai
      },
      message: 'Cập nhật thể loại thành công'
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thể loại',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory
};
