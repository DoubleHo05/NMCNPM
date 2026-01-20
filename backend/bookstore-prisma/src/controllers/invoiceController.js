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
                theLoai: {
                  select: {
                    tenTheLoai: true
                  }
                }
              },
            },
          },
        },
      },
      where: {
        tongTien: {
          gt: 0
        }
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
        category: ct.sach?.theLoai?.tenTheLoai || '',
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
                theLoai: {
                  select: {
                    tenTheLoai: true
                  }
                }
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
        category: ct.sach?.theLoai?.tenTheLoai || '',
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
    const { customerId, items, discount = 0, amountPaid = 0 } = req.body;
    const maNV = req.user?.maNV || 1;

    console.log('DEBUG INVOICE:', { customerId, items, discount, amountPaid, maNV });

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn sách cần bán',
      });
    }

    // Lấy các quy định từ database
    const rules = await prisma.quyDinh.findMany();
    const rulesMap = {};
    rules.forEach((rule) => {
      rulesMap[rule.tenQuyDinh] = rule.giaTri;
    });

    // Quy định QĐ2: Nợ tối đa cho phép (mặc định 20,000đ)
    const maxCustomerDebt = parseInt(rulesMap['NoCuoiToiDa']) || 20000;
    // Quy định QĐ2: Tồn kho tối thiểu sau bán (mặc định 20 cuốn)
    const minStockAfterSale = parseInt(rulesMap['TonKhoSauBanToiThieu']) || 20;

    // ===== KIỂM TRA QĐ2: Khách hàng nợ không quá mức cho phép =====
    if (customerId) {
      const customer = await prisma.khachHang.findUnique({
        where: { maKH: parseInt(customerId) },
        select: { tenKH: true, tienNo: true },
      });

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khách hàng',
        });
      }

      const currentDebt = parseFloat(customer.tienNo) || 0;
      if (currentDebt > maxCustomerDebt) {
        return res.status(422).json({
          success: false,
          message: `Khách hàng "${customer.tenKH}" đang nợ ${currentDebt.toLocaleString()}đ, vượt quá mức cho phép (${maxCustomerDebt.toLocaleString()}đ). Không thể lập hóa đơn.`,
          errorCode: 'DEBT_LIMIT_EXCEEDED',
        });
      }
    }

    // ===== KIỂM TRA QĐ2: Tồn kho sau bán phải >= tồn tối thiểu =====
    for (const item of items) {
      const book = await prisma.sach.findUnique({
        where: { maSach: parseInt(item.bookId) },
        select: { tenSach: true, soLuongTon: true },
      });

      if (!book) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sách với mã: ${item.bookId}`,
        });
      }

      const currentStock = book.soLuongTon || 0;
      const stockAfterSale = currentStock - item.quantity;

      // Kiểm tra đủ tồn kho để bán
      if (currentStock < item.quantity) {
        return res.status(422).json({
          success: false,
          message: `Sách "${book.tenSach}" chỉ còn ${currentStock} cuốn, không đủ để bán ${item.quantity} cuốn.`,
          errorCode: 'INSUFFICIENT_STOCK',
        });
      }

      // Kiểm tra tồn kho sau bán >= tồn tối thiểu
      if (stockAfterSale < minStockAfterSale) {
        return res.status(422).json({
          success: false,
          message: `Sách "${book.tenSach}" sau khi bán chỉ còn ${stockAfterSale} cuốn, không đạt tồn tối thiểu (${minStockAfterSale} cuốn). Vui lòng giảm số lượng bán.`,
          errorCode: 'MIN_STOCK_VIOLATED',
        });
      }
    }

    // Tính tổng tiền
    let tongTien = 0;
    for (const item of items) {
      tongTien += item.quantity * item.price;
    }
    const thanhTien = tongTien - discount;

    // Tính số tiền nợ thực sự cần tăng
    // Nếu khách trả đủ hoặc dư, không tăng nợ
    const debtToAdd = Math.max(0, thanhTien - amountPaid);

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

      // 3. Cập nhật tiền nợ khách hàng (chỉ tăng phần còn nợ)
      if (customerId && debtToAdd > 0) {
        await tx.khachHang.update({
          where: { maKH: parseInt(customerId) },
          data: {
            tienNo: {
              increment: debtToAdd,
            },
          },
        });
      }

      // 4. Tạo phiếu thu nếu khách có trả tiền
      if (customerId && amountPaid > 0) {
        await tx.phieuThuTien.create({
          data: {
            maHoaDon: newInvoice.maHoaDon,
            soTienThu: Math.min(amountPaid, thanhTien), // Chỉ ghi nhận tối đa = thành tiền
            phuongThucThanhToan: 'TIEN_MAT',
          },
        });
      }

      return newInvoice;
    });

    // Lấy lại thông tin khách hàng để trả về nợ hiện tại
    let currentDebt = 0;
    if (customerId) {
      const customer = await prisma.khachHang.findUnique({
        where: { maKH: parseInt(customerId) },
        select: { tienNo: true }
      });
      currentDebt = customer?.tienNo ? parseFloat(customer.tienNo) : 0;
    }

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
        amountPaid: amountPaid,
        debtAdded: debtToAdd,
        currentDebt: currentDebt,
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
