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
/**
 * Cập nhật thông tin sách (bao gồm ảnh)
 */
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, isbn, category, publisher, author, importPrice, salePrice, description, imageUrl, barcode, weight, pages, dimensions } = req.body;

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

    // Resolve Relations (Category, Publisher, Author)
    const { categoryId, publisherId, authorId } = await prisma.$transaction(async (tx) => {
      // 1. Category
      let cId = undefined;
      if (category) {
        const existingCat = await tx.theLoai.findUnique({ where: { tenTheLoai: category } });
        if (existingCat) cId = existingCat.maTheLoai;
        else {
          const newCat = await tx.theLoai.create({ data: { tenTheLoai: category } });
          cId = newCat.maTheLoai;
        }
      }

      // 2. Publisher
      let pId = undefined;
      if (publisher) {
        const existingPub = await tx.nhaXuatBan.findUnique({ where: { tenNXB: publisher } });
        if (existingPub) pId = existingPub.maNXB;
        else {
          const newPub = await tx.nhaXuatBan.create({ data: { tenNXB: publisher } });
          pId = newPub.maNXB;
        }
      }

      // 3. Author (Handle single author string)
      let aId = undefined;
      if (author) {
        const existingAuth = await tx.tacGia.findFirst({ where: { tenTacGia: author } });
        if (existingAuth) aId = existingAuth.maTacGia;
        else {
          const newAuth = await tx.tacGia.create({ data: { tenTacGia: author } });
          aId = newAuth.maTacGia;
        }
      }

      return { categoryId: cId, publisherId: pId, authorId: aId };
    });

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.tenSach = title;
    if (isbn !== undefined) updateData.isbn = isbn;

    // Relation IDs
    if (categoryId !== undefined) updateData.maTheLoai = categoryId;
    if (publisherId !== undefined) updateData.maNXB = publisherId;

    if (importPrice !== undefined) updateData.giaNhap = parseFloat(importPrice);
    if (salePrice !== undefined) updateData.giaBanLe = parseFloat(salePrice);
    if (description !== undefined) updateData.moTa = description;
    if (barcode !== undefined) updateData.barcode = barcode;
    if (weight !== undefined) updateData.trongLuong = parseInt(weight);
    if (pages !== undefined) updateData.soTrang = parseInt(pages);
    if (dimensions !== undefined) updateData.kichThuoc = dimensions;

    // Handle image - could be URL or base64
    if (imageUrl !== undefined) {
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        const fs = require('fs');
        const path = require('path');

        const UPLOAD_DIR = path.join(__dirname, '../../uploads/books');
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }

        const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const data = matches[2];
          const filename = `book_${id}_${Date.now()}.${ext}`;
          const filepath = path.join(UPLOAD_DIR, filename);
          fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
          updateData.hinhAnh = `/uploads/books/${filename}`;
        }
      } else {
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

    // Update Author Relation if changed
    if (authorId) {
      // remove old relations
      await prisma.sachTacGia.deleteMany({ where: { maSach: parseInt(id) } });
      // add new
      await prisma.sachTacGia.create({
        data: {
          maSach: parseInt(id),
          maTacGia: authorId
        }
      });
    }

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

/**
 * Thêm sách mới (Catalog)
 */
exports.createBook = async (req, res) => {
  try {
    const { title, isbn, category, author, publisher, publishYear, price, stock, description, imageUrl, pages, weight, dimensions } = req.body;

    // Validate valid basic info
    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: 'Tên sách và giá bán là bắt buộc'
      });
    }

    const { categoryId, publisherId, authorId } = await prisma.$transaction(async (tx) => {
      // 1. Category
      let cId;
      if (category) {
        const existingCat = await tx.theLoai.findUnique({ where: { tenTheLoai: category } });
        if (existingCat) cId = existingCat.maTheLoai;
        else {
          const newCat = await tx.theLoai.create({ data: { tenTheLoai: category } });
          cId = newCat.maTheLoai;
        }
      }

      // 2. Publisher
      let pId;
      if (publisher) {
        const existingPub = await tx.nhaXuatBan.findUnique({ where: { tenNXB: publisher } });
        if (existingPub) pId = existingPub.maNXB;
        else {
          const newPub = await tx.nhaXuatBan.create({ data: { tenNXB: publisher } });
          pId = newPub.maNXB;
        }
      }

      // 3. Author logic (Handle single author string for now)
      let aId;
      if (author) {
        const existingAuth = await tx.tacGia.findFirst({ where: { tenTacGia: author } });
        if (existingAuth) aId = existingAuth.maTacGia;
        else {
          const newAuth = await tx.tacGia.create({ data: { tenTacGia: author } });
          aId = newAuth.maTacGia;
        }
      }

      return { categoryId: cId, publisherId: pId, authorId: aId };
    });

    // Handle Image upload (base64)
    let finalImageUrl = imageUrl || '';
    if (imageUrl && imageUrl.startsWith('data:image/')) {
      const fs = require('fs');
      const path = require('path');

      const UPLOAD_DIR = path.join(__dirname, '../../uploads/books');
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
      }

      const matches = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = matches[2];
        const filename = `book_${Date.now()}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, Buffer.from(data, 'base64'));
        finalImageUrl = `/uploads/books/${filename}`;
      }
    }

    const newBook = await prisma.sach.create({
      data: {
        tenSach: title,
        isbn: isbn || null,
        maTheLoai: categoryId,
        maNXB: publisherId,
        namXuatBan: publishYear ? parseInt(publishYear) : null,
        giaBanLe: parseFloat(price),
        giaNhap: 0, // Default 0 if added via catalog, wait for import
        soLuongTon: stock ? parseInt(stock) : 0,
        moTa: description,
        hinhAnh: finalImageUrl,
        soTrang: pages ? parseInt(pages) : null,
        trongLuong: weight ? parseInt(weight) : null,
        kichThuoc: dimensions
      }
    });

    // Connect Author
    if (authorId) {
      await prisma.sachTacGia.create({
        data: {
          maSach: newBook.maSach,
          maTacGia: authorId
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Thêm sách thành công',
      data: {
        id: newBook.maSach.toString(),
        title: newBook.tenSach
      }
    });

  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm sách mới',
      error: error.message
    });
  }
};

/**
 * Xóa sách
 */
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Check constraints (e.g. references in ImportTicket details, Invoice details)
    // For now we just try delete and catch specific foreign key errors if any, 
    // or we check manually.
    // Prisma delete might fail if foreign keys exist.

    // Better to soft delete or check existence. Assuming hard delete for now as per request
    // But we strictly should delete SachTacGia relations first.

    await prisma.sachTacGia.deleteMany({
      where: { maSach: parseInt(id) }
    });

    await prisma.sach.delete({
      where: { maSach: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Đã xóa sách thành công'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    if (error.code === 'P2003') { // Foreign key constraint failed
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa sách này vì đã phát sinh giao dịch (nhập hàng/hóa đơn).'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sách',
      error: error.message
    });
  }
};
