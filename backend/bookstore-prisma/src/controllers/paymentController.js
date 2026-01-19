const prisma = require('../utils/prisma');

// Lấy tất cả phiếu thu tiền
const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.phieuThuTien.findMany({
      include: {
        hoaDon: {
          include: {
            khachHang: {
              select: {
                tenKH: true,
                soDienThoai: true,
              },
            },
          },
        },
      },
      orderBy: {
        ngayThu: 'desc',
      },
    });

    const transformedPayments = payments.map((pay) => ({
      id: pay.maPhieuThu.toString(),
      date: pay.ngayThu?.toISOString() || new Date().toISOString(),
      invoiceId: pay.maHoaDon.toString(),
      customerId: pay.hoaDon?.khachHang?.maKH?.toString() || '',
      customerName: pay.hoaDon?.khachHang?.tenKH || 'Khách vãng lai',
      customerPhone: pay.hoaDon?.khachHang?.soDienThoai || '',
      amount: parseFloat(pay.soTienThu) || 0,
      paymentMethod: pay.phuongThucThanhToan,
    }));

    res.json({
      success: true,
      data: transformedPayments,
      message: 'Lấy danh sách phiếu thu thành công',
    });
  } catch (error) {
    console.error('Error getting payments:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phiếu thu',
      error: error.message,
    });
  }
};

// Lấy chi tiết phiếu thu
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const pay = await prisma.phieuThuTien.findUnique({
      where: { maPhieuThu: parseInt(id) },
      include: {
        hoaDon: {
          include: {
            khachHang: {
              select: {
                tenKH: true,
                soDienThoai: true,
              },
            },
          },
        },
      },
    });

    if (!pay) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu thu',
      });
    }

    const transformedPayment = {
      id: pay.maPhieuThu.toString(),
      date: pay.ngayThu?.toISOString() || new Date().toISOString(),
      invoiceId: pay.maHoaDon.toString(),
      customerId: pay.hoaDon?.khachHang?.maKH?.toString() || '',
      customerName: pay.hoaDon?.khachHang?.tenKH || 'Khách vãng lai',
      customerPhone: pay.hoaDon?.khachHang?.soDienThoai || '',
      amount: parseFloat(pay.soTienThu) || 0,
      paymentMethod: pay.phuongThucThanhToan,
    };

    res.json({
      success: true,
      data: transformedPayment,
    });
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phiếu thu',
      error: error.message,
    });
  }
};

// Tạo phiếu thu mới (Thu tiền từ khách hàng)
const createPayment = async (req, res) => {
  try {
    const { customerId, amount, paymentMethod = 'TIEN_MAT' } = req.body;

    if (!customerId || !amount) {
      console.log('CreatePayment Failed: Missing fields', { customerId, amount });
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập khách hàng và số tiền',
      });
    }

    console.log('CreatePayment Request:', { customerId, amount, paymentMethod });

    // Tìm khách hàng
    const customer = await prisma.khachHang.findUnique({
      where: { maKH: parseInt(customerId) },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng',
      });
    }

    // Tìm hóa đơn chưa thanh toán của khách hàng
    // Tìm hóa đơn chưa thanh toán của khách hàng
    let unpaidInvoice = await prisma.hoaDonBanSach.findFirst({
      where: {
        maKH: parseInt(customerId),
      },
      orderBy: {
        ngayBan: 'desc',
      },
    });

    if (!unpaidInvoice) {
      // FIX: Database yêu cầu phải có MaHoaDon (FK), nên nếu không tìm thấy hóa đơn nào,
      // ta buộc phải tạo một hóa đơn "ảo" giá trị 0đ để gắn phiếu thu vào.
      // 1. Lấy ID nhân viên bất kỳ (để không bị lỗi khóa ngoại)
      const fallbackStaff = await prisma.nhanVien.findFirst({ select: { maNV: true } });
      const staffId = fallbackStaff ? fallbackStaff.maNV : 1;

      // 2. Tạo hóa đơn dummy
      unpaidInvoice = await prisma.hoaDonBanSach.create({
        data: {
          maNV: staffId,
          maKH: parseInt(customerId),
          ngayBan: new Date(), // Ngày hiện tại
          tongTien: 0,
          thanhTien: 0,
          tienGiamGia: 0
        }
      });
    }

    // Tạo phiếu thu và giảm nợ
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo phiếu thu
      const newPayment = await tx.phieuThuTien.create({
        data: {
          maHoaDon: unpaidInvoice.maHoaDon,
          soTienThu: amount,
          phuongThucThanhToan: paymentMethod,
        },
      });

      // 2. Giảm tiền nợ khách hàng
      await tx.khachHang.update({
        where: { maKH: parseInt(customerId) },
        data: {
          tienNo: {
            decrement: amount,
          },
        },
      });

      return newPayment;
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.maPhieuThu.toString(),
        date: result.ngayThu?.toISOString(),
        customerId: customerId,
        customerName: customer.tenKH,
        amount: parseFloat(result.soTienThu),
        paymentMethod: result.phuongThucThanhToan,
      },
      message: 'Thu tiền thành công',
    });
  } catch (error) {
    console.error('CRITICAL Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo phiếu thu',
      error: error.message,
    });
  }
};

// Lấy lịch sử thu tiền theo khách hàng
const getPaymentsByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const payments = await prisma.phieuThuTien.findMany({
      where: {
        hoaDon: {
          maKH: parseInt(customerId),
        },
      },
      include: {
        hoaDon: {
          select: {
            maHoaDon: true,
            ngayBan: true,
            thanhTien: true,
          },
        },
      },
      orderBy: {
        ngayThu: 'desc',
      },
    });

    const transformedPayments = payments.map((pay) => ({
      id: pay.maPhieuThu.toString(),
      date: pay.ngayThu?.toISOString() || new Date().toISOString(),
      invoiceId: pay.maHoaDon.toString(),
      amount: parseFloat(pay.soTienThu) || 0,
      paymentMethod: pay.phuongThucThanhToan,
    }));

    res.json({
      success: true,
      data: transformedPayments,
    });
  } catch (error) {
    console.error('Error getting customer payments:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử thu tiền',
      error: error.message,
    });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  getPaymentsByCustomer,
};
