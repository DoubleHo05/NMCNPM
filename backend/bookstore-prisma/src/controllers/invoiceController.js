const prisma = require('../utils/prisma');

// Lấy tất cả hóa đơn
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await prisma.hoaDonBanSach.findMany({
      include: {
        nhanVien: {
          select: {
            hoTen: true,
          },
        },
        khachHang: {
          select: {
            tenKH: true,
            soDienThoai: true,
          },
        },
        chiTiet: {
          include: {
            sach: {
              select: {
                tenSach: true,
              },
            },
          },
        },
      },
      orderBy: {
        ngayBan: 'desc',
      },
    });

    const transformedInvoices = invoices.map((inv) => ({
      id: inv.maHoaDon.toString(),
      date: inv.ngayBan?.toISOString() || new Date().toISOString(),
      customerId: inv.maKH?.toString() || '',
      customerName: inv.khachHang?.tenKH || 'Khách vãng lai',
      customerPhone: inv.khachHang?.soDienThoai || '',
      employeeName: inv.nhanVien?.hoTen || 'Không rõ',
      totalAmount: parseFloat(inv.tongTien) || 0,
      discount: parseFloat(inv.tienGiamGia) || 0,
      finalAmount: parseFloat(inv.thanhTien) || 0,
      items: inv.chiTiet.map((ct) => ({
        bookId: ct.maSach?.toString() || '',
        bookName: ct.sach?.tenSach || 'Không rõ',
        quantity: ct.soLuongBan,
        price: parseFloat(ct.giaBan) || 0,
        total: parseFloat(ct.thanhTien) || 0,
      })),
    }));

    res.json({
      success: true,
      data: transformedInvoices,
      message: 'Lấy danh sách hóa đơn thành công',
    });
  } catch (error) {
    console.error('Error getting invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách hóa đơn',
      error: error.message,
    });
  }
};

// Lấy chi tiết hóa đơn
const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const inv = await prisma.hoaDonBanSach.findUnique({
      where: { maHoaDon: parseInt(id) },
      include: {
        nhanVien: {
          select: {
            hoTen: true,
          },
        },
        khachHang: {
          select: {
            tenKH: true,
            soDienThoai: true,
          },
        },
        chiTiet: {
          include: {
            sach: {
              select: {
                tenSach: true,
              },
            },
          },
        },
      },
    });

    if (!inv) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hóa đơn',
      });
    }

    const transformedInvoice = {
      id: inv.maHoaDon.toString(),
      date: inv.ngayBan?.toISOString() || new Date().toISOString(),
      customerId: inv.maKH?.toString() || '',
      customerName: inv.khachHang?.tenKH || 'Khách vãng lai',
      customerPhone: inv.khachHang?.soDienThoai || '',
      employeeName: inv.nhanVien?.hoTen || 'Không rõ',
      totalAmount: parseFloat(inv.tongTien) || 0,
      discount: parseFloat(inv.tienGiamGia) || 0,
      finalAmount: parseFloat(inv.thanhTien) || 0,
      items: inv.chiTiet.map((ct) => ({
        bookId: ct.maSach?.toString() || '',
        bookName: ct.sach?.tenSach || 'Không rõ',
        quantity: ct.soLuongBan,
        price: parseFloat(ct.giaBan) || 0,
        total: parseFloat(ct.thanhTien) || 0,
      })),
    };

    res.json({
      success: true,
      data: transformedInvoice,
    });
  } catch (error) {
    console.error('Error getting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin hóa đơn',
      error: error.message,
    });
  }
};

// Tạo hóa đơn mới
const createInvoice = async (req, res) => {
  try {
    const { customerId, items, discount = 0 } = req.body;
    const maNV = req.user?.maNV || 1;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn sách cần bán',
      });
    }

    // Tính tổng tiền
    let tongTien = 0;
    for (const item of items) {
      tongTien += item.quantity * item.price;
    }
    const thanhTien = tongTien - discount;

    // Tạo hóa đơn với transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo hóa đơn
      const newInvoice = await tx.hoaDonBanSach.create({
        data: {
          maNV,
          maKH: customerId ? parseInt(customerId) : null,
          tongTien,
          tienGiamGia: discount,
          thanhTien,
          chiTiet: {
            create: items.map((item) => ({
              maSach: parseInt(item.bookId),
              soLuongBan: item.quantity,
              giaBan: item.price,
              thanhTien: item.quantity * item.price,
            })),
          },
        },
        include: {
          khachHang: true,
          chiTiet: {
            include: {
              sach: true,
            },
          },
        },
      });

      // 2. Giảm số lượng tồn cho từng sách
      for (const item of items) {
        await tx.sach.update({
          where: { maSach: parseInt(item.bookId) },
          data: {
            soLuongTon: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Cập nhật tiền nợ khách hàng (nếu có)
      if (customerId) {
        await tx.khachHang.update({
          where: { maKH: parseInt(customerId) },
          data: {
            tienNo: {
              increment: thanhTien,
            },
          },
        });
      }

      return newInvoice;
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.maHoaDon.toString(),
        date: result.ngayBan?.toISOString(),
        customerId: result.maKH?.toString(),
        customerName: result.khachHang?.tenKH || 'Khách vãng lai',
        totalAmount: parseFloat(result.tongTien),
        discount: parseFloat(result.tienGiamGia),
        finalAmount: parseFloat(result.thanhTien),
        items: result.chiTiet.map((ct) => ({
          bookId: ct.maSach?.toString(),
          bookName: ct.sach?.tenSach,
          quantity: ct.soLuongBan,
          price: parseFloat(ct.giaBan),
        })),
      },
      message: 'Tạo hóa đơn thành công',
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo hóa đơn',
      error: error.message,
    });
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
};
