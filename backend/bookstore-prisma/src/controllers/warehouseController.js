const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Lấy danh sách tất cả sách trong kho
 */
exports.getWarehouseItems = async (req, res) => {
  try {
    const items = await prisma.sach.findMany({
      select: {
        maSach: true,
        tenSach: true,
        isbn: true,
        soLuongTon: true,
        tonKhoToiThieu: true,
        giaNhap: true,
        giaBanLe: true,
        theLoai: {
          select: {
            tenTheLoai: true
          }
        },
        nhaXuatBan: {
          select: {
            tenNXB: true
          }
        }
      },
      orderBy: {
        tenSach: 'asc'
      }
    });

    const formattedItems = items.map(item => ({
      id: item.maSach.toString(),
      bookId: item.maSach.toString(),
      bookTitle: item.tenSach,
      isbn: item.isbn,
      quantity: item.soLuongTon,
      minStock: item.tonKhoToiThieu || 10,
      location: item.theLoai?.tenTheLoai || 'Chưa phân loại',
      category: item.theLoai?.tenTheLoai,
      publisher: item.nhaXuatBan?.tenNXB,
      importPrice: parseFloat(item.giaNhap),
      salePrice: parseFloat(item.giaBanLe)
    }));

    res.status(200).json({
      success: true,
      data: formattedItems
    });
  } catch (error) {
    console.error('Error getting warehouse items:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách kho',
      error: error.message
    });
  }
};

/**
 * Lấy thông tin chi tiết một sách trong kho
 */
exports.getWarehouseItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.sach.findUnique({
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

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: item.maSach.toString(),
        bookId: item.maSach.toString(),
        bookTitle: item.tenSach,
        isbn: item.isbn,
        quantity: item.soLuongTon,
        category: item.theLoai?.tenTheLoai,
        publisher: item.nhaXuatBan?.tenNXB,
        importPrice: parseFloat(item.giaNhap),
        salePrice: parseFloat(item.giaBanLe),
        description: item.moTa,
        authors: item.tacGia.map(st => st.tacGia.tenTacGia)
      }
    });
  } catch (error) {
    console.error('Error getting warehouse item:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sách',
      error: error.message
    });
  }
};

/**
 * Cập nhật thông tin sách trong kho
 */
exports.updateWarehouseItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, minStock, location } = req.body;

    console.log('Update request:', { id, quantity, minStock, location });

    const updateData = {};
    if (quantity !== undefined) {
      updateData.soLuongTon = quantity;
    }
    if (minStock !== undefined) {
      updateData.tonKhoToiThieu = minStock;
    }
    // location không có trong schema

    const updatedItem = await prisma.sach.update({
      where: { maSach: parseInt(id) },
      data: updateData
    });

    console.log('Updated item:', updatedItem);

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: {
        id: updatedItem.maSach.toString(),
        quantity: updatedItem.soLuongTon,
        minStock: updatedItem.tonKhoToiThieu,
        location: location || 'N/A'
      }
    });
  } catch (error) {
    console.error('Error updating warehouse item:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thông tin sách',
      error: error.message
    });
  }
};

/**
 * Lấy danh sách phiếu nhập
 */
exports.getImports = async (req, res) => {
  try {
    const imports = await prisma.phieuNhapSach.findMany({
      include: {
        nhanVien: {
          select: {
            hoTen: true,
            tenDangNhap: true
          }
        },
        chiTiet: {
          include: {
            sach: {
              select: {
                tenSach: true,
                isbn: true
              }
            }
          }
        }
      },
      orderBy: {
        ngayNhap: 'desc'
      }
    });

    const formattedImports = imports.map(imp => ({
      id: imp.maPhieuNhap.toString(),
      importDate: imp.ngayNhap,
      totalAmount: parseFloat(imp.tongTienNhap || 0),
      employee: imp.nhanVien.hoTen,
      status: 'completed',
      items: imp.chiTiet.map(ct => ({
        bookId: ct.maSach?.toString(),
        bookTitle: ct.sach?.tenSach,
        quantity: ct.soLuongNhap,
        price: parseFloat(ct.giaNhap)
      }))
    }));

    res.status(200).json({
      success: true,
      data: formattedImports
    });
  } catch (error) {
    console.error('Error getting imports:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phiếu nhập',
      error: error.message
    });
  }
};

/**
 * Tạo phiếu nhập mới
 */
exports.createImport = async (req, res) => {
  try {
    const { importDate, supplier, notes, items, status } = req.body;
    
    // Lấy user từ middleware auth, hoặc dùng user mặc định (maNV = 1) nếu không có
    let maNV = 1; // Default user ID
    if (req.user && req.user.maNV) {
      maNV = req.user.maNV;
    } else {
      // Tìm nhân viên đầu tiên trong database
      const firstEmployee = await prisma.nhanVien.findFirst();
      if (firstEmployee) {
        maNV = firstEmployee.maNV;
      }
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Phiếu nhập phải có ít nhất một sách'
      });
    }

    // Tính tổng tiền nhập
    let tongTienNhap = 0;
    const chiTietItems = [];

    for (const item of items) {
      console.log('Processing item:', item);
      
      if (!item.bookId) {
        return res.status(400).json({
          success: false,
          message: 'bookId is required for each item'
        });
      }
      
      const bookId = parseInt(item.bookId);
      if (isNaN(bookId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid bookId: ${item.bookId}`
        });
      }
      
      const sach = await prisma.sach.findUnique({
        where: { maSach: bookId }
      });

      if (!sach) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sách với mã ${item.bookId}`
        });
      }

      const thanhTien = parseFloat(sach.giaNhap) * item.quantity;
      tongTienNhap += thanhTien;

      chiTietItems.push({
        maSach: parseInt(item.bookId),
        soLuongNhap: item.quantity,
        giaNhap: sach.giaNhap,
        thanhTien: thanhTien
      });
    }

    // Tạo phiếu nhập và chi tiết trong transaction
    const result = await prisma.$transaction(async (tx) => {
      // Tạo phiếu nhập
      const phieuNhap = await tx.phieuNhapSach.create({
        data: {
          maNV: maNV,
          ngayNhap: importDate ? new Date(importDate) : new Date(),
          tongTienNhap: tongTienNhap,
          chiTiet: {
            create: chiTietItems
          }
        },
        include: {
          chiTiet: true
        }
      });

      // Cập nhật số lượng tồn kho cho từng sách
      for (const item of items) {
        await tx.sach.update({
          where: { maSach: parseInt(item.bookId) },
          data: {
            soLuongTon: {
              increment: item.quantity
            }
          }
        });
      }

      return phieuNhap;
    });

    res.status(201).json({
      success: true,
      message: 'Tạo phiếu nhập thành công',
      data: {
        id: result.maPhieuNhap.toString(),
        importDate: result.ngayNhap,
        totalAmount: parseFloat(result.tongTienNhap),
        items: result.chiTiet.map(ct => ({
          bookId: ct.maSach.toString(),
          quantity: ct.soLuongNhap,
          price: parseFloat(ct.giaNhap)
        }))
      }
    });
  } catch (error) {
    console.error('Error creating import:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phiếu nhập',
      error: error.message
    });
  }
};

/**
 * Lấy thống kê kho
 */
exports.getWarehouseStats = async (req, res) => {
  try {
    const totalBooks = await prisma.sach.count();
    
    const totalQuantity = await prisma.sach.aggregate({
      _sum: {
        soLuongTon: true
      }
    });

    const totalValue = await prisma.sach.aggregate({
      _sum: {
        soLuongTon: true
      }
    });

    // Sách sắp hết (dưới 10 cuốn)
    const lowStockBooks = await prisma.sach.count({
      where: {
        soLuongTon: {
          lt: 10
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalQuantity: totalQuantity._sum.soLuongTon || 0,
        lowStockBooks,
        totalValue: 0 // Có thể tính sau
      }
    });
  } catch (error) {
    console.error('Error getting warehouse stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê kho',
      error: error.message
    });
  }
};
