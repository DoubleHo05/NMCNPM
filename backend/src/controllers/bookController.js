const prisma = require('../config/database');

// Lấy tất cả sách
const getAllBooks = async (req, res) => {
  try {
    const { search, maTheLoai, maNXB, page = 1, limit = 20 } = req.query;
    
    const where = {};
    
    if (search) {
      where.OR = [
        { tenSach: { contains: search } },
        { isbn: { contains: search } },
        { barcode: { contains: search } },
      ];
    }
    
    if (maTheLoai) {
      where.maTheLoai = parseInt(maTheLoai);
    }
    
    if (maNXB) {
      where.maNXB = parseInt(maNXB);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [books, total] = await Promise.all([
      prisma.sach.findMany({
        where,
        include: {
          theLoai: true,
          nhaXuatBan: true,
          tacGia: {
            include: {
              tacGia: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: { maSach: 'desc' },
      }),
      prisma.sach.count({ where }),
    ]);

    // Transform data để dễ sử dụng ở frontend
    const transformedBooks = books.map(book => ({
      ...book,
      tacGia: book.tacGia.map(stg => stg.tacGia),
    }));

    res.status(200).json({
      success: true,
      data: {
        books: transformedBooks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sách',
    });
  }
};

// Lấy sách theo ID
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

    res.status(200).json({
      success: true,
      data: {
        ...book,
        tacGia: book.tacGia.map(stg => stg.tacGia),
      },
    });
  } catch (error) {
    console.error('Get book by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin sách',
    });
  }
};

// Tìm sách theo barcode hoặc ISBN
const getBookByBarcode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const book = await prisma.sach.findFirst({
      where: {
        OR: [
          { barcode: code },
          { isbn: code },
        ],
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

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách với mã này',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...book,
        tacGia: book.tacGia.map(stg => stg.tacGia),
      },
    });
  } catch (error) {
    console.error('Get book by barcode error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm sách',
    });
  }
};

// Tạo sách mới
const createBook = async (req, res) => {
  try {
    const { tenSach, isbn, maTheLoai, maNXB, giaNhap, giaBanLe, soLuongTon, moTa, barcode, tacGiaIds } = req.body;

    const book = await prisma.sach.create({
      data: {
        tenSach,
        isbn,
        maTheLoai: maTheLoai ? parseInt(maTheLoai) : null,
        maNXB: maNXB ? parseInt(maNXB) : null,
        giaNhap: parseFloat(giaNhap),
        giaBanLe: parseFloat(giaBanLe),
        soLuongTon: soLuongTon ? parseInt(soLuongTon) : 0,
        moTa,
        barcode,
        tacGia: tacGiaIds ? {
          create: tacGiaIds.map(id => ({
            tacGia: { connect: { maTacGia: parseInt(id) } },
          })),
        } : undefined,
      },
      include: {
        theLoai: true,
        nhaXuatBan: true,
        tacGia: {
          include: { tacGia: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Tạo sách thành công',
      data: book,
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo sách',
    });
  }
};

// Cập nhật sách
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenSach, isbn, maTheLoai, maNXB, giaNhap, giaBanLe, soLuongTon, moTa, barcode } = req.body;

    const book = await prisma.sach.update({
      where: { maSach: parseInt(id) },
      data: {
        tenSach,
        isbn,
        maTheLoai: maTheLoai ? parseInt(maTheLoai) : null,
        maNXB: maNXB ? parseInt(maNXB) : null,
        giaNhap: giaNhap ? parseFloat(giaNhap) : undefined,
        giaBanLe: giaBanLe ? parseFloat(giaBanLe) : undefined,
        soLuongTon: soLuongTon !== undefined ? parseInt(soLuongTon) : undefined,
        moTa,
        barcode,
      },
      include: {
        theLoai: true,
        nhaXuatBan: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật sách thành công',
      data: book,
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật sách',
    });
  }
};

// Xóa sách
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Xóa liên kết tác giả trước
    await prisma.sachTacGia.deleteMany({
      where: { maSach: parseInt(id) },
    });

    await prisma.sach.delete({
      where: { maSach: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Xóa sách thành công',
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa sách',
    });
  }
};

// Lấy danh sách thể loại
const getCategories = async (req, res) => {
  try {
    const categories = await prisma.theLoai.findMany({
      orderBy: { tenTheLoai: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách thể loại',
    });
  }
};

// Lấy danh sách NXB
const getPublishers = async (req, res) => {
  try {
    const publishers = await prisma.nhaXuatBan.findMany({
      orderBy: { tenNXB: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: publishers,
    });
  } catch (error) {
    console.error('Get publishers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách NXB',
    });
  }
};

// Lấy danh sách tác giả
const getAuthors = async (req, res) => {
  try {
    const authors = await prisma.tacGia.findMany({
      orderBy: { tenTacGia: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: authors,
    });
  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách tác giả',
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getBookByBarcode,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getPublishers,
  getAuthors,
};
