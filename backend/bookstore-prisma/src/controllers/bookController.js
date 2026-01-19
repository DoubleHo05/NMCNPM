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

    // Helper to get full image URL
    const getFullImageUrl = (imagePath, req) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) return imagePath;
      if (imagePath.startsWith('/uploads')) {
        return `${req.protocol}://${req.get('host')}${imagePath}`;
      }
      return imagePath;
    };

    const formattedBooks = books.map(book => ({
      id: book.maSach.toString(),
      title: book.tenSach,
      isbn: book.isbn,
      category: book.theLoai?.tenTheLoai,
      publisher: book.nhaXuatBan?.tenNXB,
      authors: book.tacGia.map(st => st.tacGia.tenTacGia),
      author: book.tacGia.map(st => st.tacGia.tenTacGia).join(', '),
      importPrice: parseFloat(book.giaNhap),
      salePrice: parseFloat(book.giaBanLe),
      price: parseFloat(book.giaBanLe),
      stock: book.soLuongTon,
      description: book.moTa,
      barcode: book.barcode,
      imageUrl: getFullImageUrl(book.hinhAnh, req),
      pages: book.soTrang,
      weight: book.trongLuong,
      dimensions: book.kichThuoc,
      publishYear: book.namXuatBan
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

    // Helper to get full image URL
    const getFullImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) return imagePath;
      if (imagePath.startsWith('/uploads')) {
        return `${req.protocol}://${req.get('host')}${imagePath}`;
      }
      return imagePath;
    };

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
        author: book.tacGia.map(st => st.tacGia.tenTacGia).join(', '),
        importPrice: parseFloat(book.giaNhap),
        salePrice: parseFloat(book.giaBanLe),
        price: parseFloat(book.giaBanLe),
        stock: book.soLuongTon,
        description: book.moTa,
        barcode: book.barcode,
        imageUrl: getFullImageUrl(book.hinhAnh),
        pages: book.soTrang,
        weight: book.trongLuong,
        dimensions: book.kichThuoc,
        publishYear: book.namXuatBan
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

/**
 * Cập nhật thông tin sách (bao gồm ảnh)
 */
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isbn, categoryId, publisherId, importPrice, salePrice, description, imageUrl, barcode } = req.body;

    // Check if book exists
    const existingBook = await prisma.sach.findUnique({
      where: { maSach: parseInt(id) }
    });

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.tenSach = title;
    if (isbn !== undefined) updateData.isbn = isbn;
    if (categoryId !== undefined) updateData.maTheLoai = parseInt(categoryId);
    if (publisherId !== undefined) updateData.maNXB = parseInt(publisherId);
    if (importPrice !== undefined) updateData.giaNhap = parseFloat(importPrice);
    if (salePrice !== undefined) updateData.giaBanLe = parseFloat(salePrice);
    if (description !== undefined) updateData.moTa = description;
    if (barcode !== undefined) updateData.barcode = barcode;

    // Handle image - could be URL or base64
    if (imageUrl !== undefined) {
      // If base64, save to file
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const fs = require('fs');
        const path = require('path');
        const crypto = require('crypto');

        const UPLOAD_DIR = path.join(__dirname, '../../uploads/books');
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const data = matches[2];
          const filename = `book_${id}.${ext}`;
          const filepath = path.join(UPLOAD_DIR, filename);
          fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
          updateData.hinhAnh = `/uploads/books/${filename}`;
        }
      } else {
        // URL or empty
        updateData.hinhAnh = imageUrl;
      }
    }

    // Update book
    const updatedBook = await prisma.sach.update({
      where: { maSach: parseInt(id) },
      data: updateData,
      include: {
        theLoai: true,
        nhaXuatBan: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật sách thành công',
      data: {
        id: updatedBook.maSach.toString(),
        title: updatedBook.tenSach,
        isbn: updatedBook.isbn,
        imageUrl: updatedBook.hinhAnh
      }
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sách',
      error: error.message
    });
  }

};
