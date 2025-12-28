const prisma = require('../utils/prisma');

// Lấy tất cả sách với thông tin đầy đủ
const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.sach.findMany({
      include: {
        theLoai: true,
        nhaXuatBan: true,
        tacGia: {
          include: {
            tacGia: true,
          },
        },
      },
      orderBy: {
        maSach: 'desc',
      },
    });

    // Transform data cho frontend
    const transformedBooks = books.map((book) => ({
      id: book.maSach.toString(),
      title: book.tenSach,
      category: book.theLoai?.tenTheLoai || 'Chưa phân loại',
      author: book.tacGia.map((st) => st.tacGia.tenTacGia).join(', ') || 'Không rõ',
      stock: book.soLuongTon || 0,
      price: parseFloat(book.giaBanLe) || 0,
      publisher: book.nhaXuatBan?.tenNXB || '',
      publishYear: new Date().getFullYear(), // Database không có trường này
      imageUrl: '', // Database không có trường này
      isbn: book.isbn || '',
      description: book.moTa || '',
      barcode: book.barcode || '',
      giaNhap: parseFloat(book.giaNhap) || 0,
    }));

    res.json({
      success: true,
      data: transformedBooks,
      message: 'Lấy danh sách sách thành công',
    });
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sách',
      error: error.message,
    });
  }
};

// Lấy chi tiết một sách
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await prisma.sach.findUnique({
      where: { maSach: parseInt(id) },
      include: {
        theLoai: true,
        nhaXuatBan: true,
        tacGia: {
          include: {
            tacGia: true,
          },
        },
      },
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách',
      });
    }

    const transformedBook = {
      id: book.maSach.toString(),
      title: book.tenSach,
      category: book.theLoai?.tenTheLoai || 'Chưa phân loại',
      author: book.tacGia.map((st) => st.tacGia.tenTacGia).join(', ') || 'Không rõ',
      stock: book.soLuongTon || 0,
      price: parseFloat(book.giaBanLe) || 0,
      publisher: book.nhaXuatBan?.tenNXB || '',
      publishYear: new Date().getFullYear(),
      imageUrl: '',
      isbn: book.isbn || '',
      description: book.moTa || '',
      barcode: book.barcode || '',
      giaNhap: parseFloat(book.giaNhap) || 0,
    };

    res.json({
      success: true,
      data: transformedBook,
    });
  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sách',
      error: error.message,
    });
  }
};

// Thêm sách mới
const createBook = async (req, res) => {
  try {
    const { tenSach, isbn, maTheLoai, maNXB, giaNhap, giaBanLe, soLuongTon, moTa, barcode, tacGiaIds } = req.body;

    // Validate required fields
    if (!tenSach || !giaNhap || !giaBanLe) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc (tên sách, giá nhập, giá bán)',
      });
    }

    const newBook = await prisma.sach.create({
      data: {
        tenSach,
        isbn,
        maTheLoai: maTheLoai ? parseInt(maTheLoai) : null,
        maNXB: maNXB ? parseInt(maNXB) : null,
        giaNhap: parseFloat(giaNhap),
        giaBanLe: parseFloat(giaBanLe),
        soLuongTon: parseInt(soLuongTon) || 0,
        moTa,
        barcode,
        tacGia: tacGiaIds && tacGiaIds.length > 0 ? {
          create: tacGiaIds.map((maTacGia) => ({
            maTacGia: parseInt(maTacGia),
          })),
        } : undefined,
      },
      include: {
        theLoai: true,
        nhaXuatBan: true,
        tacGia: {
          include: {
            tacGia: true,
          },
        },
      },
    });

    const transformedBook = {
      id: newBook.maSach.toString(),
      title: newBook.tenSach,
      category: newBook.theLoai?.tenTheLoai || 'Chưa phân loại',
      author: newBook.tacGia.map((st) => st.tacGia.tenTacGia).join(', ') || 'Không rõ',
      stock: newBook.soLuongTon || 0,
      price: parseFloat(newBook.giaBanLe) || 0,
      publisher: newBook.nhaXuatBan?.tenNXB || '',
      publishYear: new Date().getFullYear(),
      imageUrl: '',
      isbn: newBook.isbn || '',
      description: newBook.moTa || '',
      barcode: newBook.barcode || '',
      giaNhap: parseFloat(newBook.giaNhap) || 0,
    };

    res.status(201).json({
      success: true,
      data: transformedBook,
      message: 'Thêm sách thành công',
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm sách',
      error: error.message,
    });
  }
};

// Cập nhật sách
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenSach, isbn, maTheLoai, maNXB, giaNhap, giaBanLe, soLuongTon, moTa, barcode, tacGiaIds } = req.body;

    // Check if book exists
    const existingBook = await prisma.sach.findUnique({
      where: { maSach: parseInt(id) },
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách',
      });
    }

    // Update book with new data
    const updatedBook = await prisma.sach.update({
      where: { maSach: parseInt(id) },
      data: {
        tenSach: tenSach || existingBook.tenSach,
        isbn: isbn !== undefined ? isbn : existingBook.isbn,
        maTheLoai: maTheLoai ? parseInt(maTheLoai) : existingBook.maTheLoai,
        maNXB: maNXB ? parseInt(maNXB) : existingBook.maNXB,
        giaNhap: giaNhap ? parseFloat(giaNhap) : existingBook.giaNhap,
        giaBanLe: giaBanLe ? parseFloat(giaBanLe) : existingBook.giaBanLe,
        soLuongTon: soLuongTon !== undefined ? parseInt(soLuongTon) : existingBook.soLuongTon,
        moTa: moTa !== undefined ? moTa : existingBook.moTa,
        barcode: barcode !== undefined ? barcode : existingBook.barcode,
      },
      include: {
        theLoai: true,
        nhaXuatBan: true,
        tacGia: {
          include: {
            tacGia: true,
          },
        },
      },
    });

    // Update authors if provided
    if (tacGiaIds && tacGiaIds.length > 0) {
      // Delete existing relations
      await prisma.sachTacGia.deleteMany({
        where: { maSach: parseInt(id) },
      });
      // Create new relations
      await prisma.sachTacGia.createMany({
        data: tacGiaIds.map((maTacGia) => ({
          maSach: parseInt(id),
          maTacGia: parseInt(maTacGia),
        })),
      });
    }

    const transformedBook = {
      id: updatedBook.maSach.toString(),
      title: updatedBook.tenSach,
      category: updatedBook.theLoai?.tenTheLoai || 'Chưa phân loại',
      author: updatedBook.tacGia.map((st) => st.tacGia.tenTacGia).join(', ') || 'Không rõ',
      stock: updatedBook.soLuongTon || 0,
      price: parseFloat(updatedBook.giaBanLe) || 0,
      publisher: updatedBook.nhaXuatBan?.tenNXB || '',
      publishYear: new Date().getFullYear(),
      imageUrl: '',
      isbn: updatedBook.isbn || '',
      description: updatedBook.moTa || '',
      barcode: updatedBook.barcode || '',
      giaNhap: parseFloat(updatedBook.giaNhap) || 0,
    };

    res.json({
      success: true,
      data: transformedBook,
      message: 'Cập nhật sách thành công',
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sách',
      error: error.message,
    });
  }
};

// Xóa sách
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const existingBook = await prisma.sach.findUnique({
      where: { maSach: parseInt(id) },
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách',
      });
    }

    // Delete related records first
    await prisma.sachTacGia.deleteMany({
      where: { maSach: parseInt(id) },
    });

    // Delete book
    await prisma.sach.delete({
      where: { maSach: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Xóa sách thành công',
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sách',
      error: error.message,
    });
  }
};

// Lấy danh sách thể loại
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.theLoai.findMany({
      orderBy: { tenTheLoai: 'asc' },
    });

    res.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.maTheLoai,
        name: cat.tenTheLoai,
      })),
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thể loại',
      error: error.message,
    });
  }
};

// Lấy danh sách nhà xuất bản
const getPublishers = async (req, res) => {
  try {
    const publishers = await prisma.nhaXuatBan.findMany({
      orderBy: { tenNXB: 'asc' },
    });

    res.json({
      success: true,
      data: publishers.map((pub) => ({
        id: pub.maNXB,
        name: pub.tenNXB,
        address: pub.diaChi,
        phone: pub.soDienThoai,
      })),
    });
  } catch (error) {
    console.error('Error getting publishers:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhà xuất bản',
      error: error.message,
    });
  }
};

// Lấy danh sách tác giả
const getAuthors = async (req, res) => {
  try {
    const authors = await prisma.tacGia.findMany({
      orderBy: { tenTacGia: 'asc' },
    });

    res.json({
      success: true,
      data: authors.map((author) => ({
        id: author.maTacGia,
        name: author.tenTacGia,
      })),
    });
  } catch (error) {
    console.error('Error getting authors:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách tác giả',
      error: error.message,
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getPublishers,
  getAuthors,
};
