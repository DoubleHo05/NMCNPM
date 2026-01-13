const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Lấy danh sách tất cả sách
 */
exports.getAllBooks = async (req, res) => {
  try {
    const books = await prisma.sach.findMany({
      include: {
        theLoai: {
          select: {
            tenTheLoai: true
          }
        },
        nhaXuatBan: {
          select: {
            tenNXB: true
          }
        },
        tacGia: {
          include: {
            tacGia: {
              select: {
                tenTacGia: true
              }
            }
          }
        }
      },
      orderBy: {
        tenSach: 'asc'
      }
    });

    const formattedBooks = books.map(book => ({
      id: book.maSach.toString(),
      title: book.tenSach,
      isbn: book.isbn,
      category: book.theLoai?.tenTheLoai,
      publisher: book.nhaXuatBan?.tenNXB,
      authors: book.tacGia.map(st => st.tacGia.tenTacGia),
      importPrice: parseFloat(book.giaNhap),
      salePrice: parseFloat(book.giaBanLe),
      stock: book.soLuongTon,
      description: book.moTa,
      barcode: book.barcode,
      imageUrl: book.hinhAnh || null
    }));

    res.status(200).json({
      success: true,
      data: formattedBooks
    });
  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sách',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin chi tiết một sách
 */
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await prisma.sach.findUnique({
      where: { maSach: parseInt(id) },
      include: {
        theLoai: true,
        nhaXuatBan: true,
        tacGia: {
          include: {
            tacGia: true
          }
        }
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: book.maSach.toString(),
        title: book.tenSach,
        isbn: book.isbn,
        category: book.theLoai?.tenTheLoai,
        categoryId: book.maTheLoai,
        publisher: book.nhaXuatBan?.tenNXB,
        publisherId: book.maNXB,
        authors: book.tacGia.map(st => ({
          id: st.tacGia.maTacGia,
          name: st.tacGia.tenTacGia
        })),
        importPrice: parseFloat(book.giaNhap),
        salePrice: parseFloat(book.giaBanLe),
        stock: book.soLuongTon,
        description: book.moTa,
        barcode: book.barcode,
        imageUrl: book.hinhAnh || null
      }
    });
  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sách',
      error: error.message
    });
  }
};

/**
 * Tìm kiếm sách
 */
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return exports.getAllBooks(req, res);
    }

    const books = await prisma.sach.findMany({
      where: {
        OR: [
          {
            tenSach: {
              contains: q
            }
          },
          {
            isbn: {
              contains: q
            }
          },
          {
            barcode: {
              contains: q
            }
          }
        ]
      },
      include: {
        theLoai: {
          select: {
            tenTheLoai: true
          }
        },
        nhaXuatBan: {
          select: {
            tenNXB: true
          }
        },
        tacGia: {
          include: {
            tacGia: {
              select: {
                tenTacGia: true
              }
            }
          }
        }
      }
    });

    const formattedBooks = books.map(book => ({
      id: book.maSach.toString(),
      title: book.tenSach,
      isbn: book.isbn,
      category: book.theLoai?.tenTheLoai,
      publisher: book.nhaXuatBan?.tenNXB,
      authors: book.tacGia.map(st => st.tacGia.tenTacGia),
      importPrice: parseFloat(book.giaNhap),
      salePrice: parseFloat(book.giaBanLe),
      stock: book.soLuongTon
    }));

    res.status(200).json({
      success: true,
      data: formattedBooks
    });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm sách',
      error: error.message
    });
  }
};
