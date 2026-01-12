// services/paymentService.js
const prisma = require('../config/database');
const { 
  ValidationError, 
  BusinessRuleError, 
  NotFoundError,
  PaymentExceedDebtError 
} = require('../utils/errorTypes');

class PaymentService {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
  }

  /**
   * Lập phiếu thu tiền
   * @param {Object} paymentData - Dữ liệu phiếu thu
   * @param {number} paymentData.customerId - ID khách hàng
   * @param {number} paymentData.employeeId - ID nhân viên thu tiền
   * @param {number} paymentData.amount - Số tiền thu
   * @param {string} paymentData.paymentMethod - Hình thức thanh toán
   * @param {number} paymentData.invoiceId - ID hóa đơn (optional)
   * @param {string} paymentData.notes - Ghi chú (optional)
   * @returns {Promise<Object>} Phiếu thu đã tạo
   */
  async createPayment(paymentData) {
    const { 
      customerId, 
      employeeId, 
      amount, 
      paymentMethod, 
      invoiceId = null,
      notes = null 
    } = paymentData;

    // Validation cơ bản
    if (!customerId) {
      throw new ValidationError('Mã khách hàng là bắt buộc');
    }

    if (!employeeId) {
      throw new ValidationError('Mã nhân viên là bắt buộc');
    }

    if (!amount || amount <= 0) {
      throw new ValidationError('Số tiền thu phải lớn hơn 0');
    }

    // Map payment method từ controller sang enum trong DB
    const paymentMethodMap = {
      'TIEN_MAT': 'TIEN_MAT',
      'THE': 'THE_NGAN_HANG',
      'CHUYEN_KHOAN': 'VI_DIEN_TU'
    };

    const dbPaymentMethod = paymentMethodMap[paymentMethod] || 'TIEN_MAT';

    // Bắt đầu transaction
    return await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra nhân viên tồn tại và có quyền thu tiền
      const employee = await tx.nhanVien.findUnique({
        where: { maNV: employeeId }
      });

      if (!employee) {
        throw new NotFoundError('Không tìm thấy nhân viên');
      }

      if (employee.vaiTro !== 'THU_NGAN' && employee.vaiTro !== 'QUAN_LY') {
        throw new BusinessRuleError('Chỉ thu ngân hoặc quản lý mới được thu tiền');
      }

      if (!employee.trangThai) {
        throw new BusinessRuleError('Tài khoản nhân viên đã bị khóa');
      }

      // 2. Kiểm tra khách hàng tồn tại và số nợ hiện tại
      const customer = await tx.khachHang.findUnique({
        where: { maKH: customerId }
      });

      if (!customer) {
        throw new NotFoundError('Không tìm thấy khách hàng');
      }

      const currentDebt = customer.congNo ? parseFloat(customer.congNo) : 0;

      // Kiểm tra khách hàng có nợ không
      if (currentDebt <= 0) {
        throw new BusinessRuleError('Khách hàng không có nợ cần thanh toán');
      }

      // 3. Kiểm tra: Số tiền thu không vượt quá số tiền nợ
      const usePaymentLimit = await this.checkPaymentLimitRegulation(tx);

      if (usePaymentLimit && amount > currentDebt) {
        throw new PaymentExceedDebtError(
          `Số tiền thu (${amount.toLocaleString()}đ) vượt quá số tiền nợ hiện tại (${currentDebt.toLocaleString()}đ)`
        );
      }

      // 4. Nếu có invoiceId, kiểm tra hóa đơn
      let invoice = null;
      if (invoiceId) {
        invoice = await tx.hoaDonBanSach.findUnique({
          where: { maHoaDon: invoiceId },
          include: {
            phieuThu: true
          }
        });

        if (!invoice) {
          throw new NotFoundError('Không tìm thấy hóa đơn');
        }

        if (invoice.maKH !== customerId) {
          throw new BusinessRuleError('Hóa đơn không thuộc về khách hàng này');
        }

        // Tính số tiền đã thanh toán cho hóa đơn này
        const totalPaid = invoice.phieuThu.reduce(
          (sum, p) => sum + parseFloat(p.soTienThu), 
          0
        );
        const invoiceRemaining = parseFloat(invoice.thanhTien || 0) - totalPaid;

        // Cảnh báo nếu thanh toán quá số tiền hóa đơn
        if (amount > invoiceRemaining) {
          throw new BusinessRuleError(
            `Số tiền thu vượt quá số tiền còn lại của hóa đơn (${invoiceRemaining.toLocaleString()}đ)`
          );
        }
      }

      // 5. Tạo phiếu thu
      const payment = await tx.phieuThuTien.create({
        data: {
          maKH: customerId,
          maNV: employeeId,
          maHoaDon: invoiceId,
          soTienThu: amount,
          phuongThucThanhToan: dbPaymentMethod,
          ghiChu: notes,
          ngayThu: new Date(),
          trangThai: 'ACTIVE'
        }
      });

      // 6. Cập nhật công nợ khách hàng
      const newDebt = currentDebt - amount;
      await tx.khachHang.update({
        where: { maKH: customerId },
        data: {
          congNo: newDebt
        }
      });

      // 7. Cập nhật trạng thái hóa đơn (nếu có)
      if (invoiceId && invoice) {
        const totalPaid = invoice.phieuThu.reduce(
          (sum, p) => sum + parseFloat(p.soTienThu), 
          0
        ) + amount;

        const invoiceFinalAmount = parseFloat(invoice.thanhTien || 0);
        let newStatus = 'CHUA_THANH_TOAN';

        if (totalPaid >= invoiceFinalAmount) {
          newStatus = 'DA_THANH_TOAN';
        } else if (totalPaid > 0) {
          newStatus = 'THANH_TOAN_MOT_PHAN';
        }

        await tx.hoaDonBanSach.update({
          where: { maHoaDon: invoiceId },
          data: { trangThai: newStatus }
        });
      }

      // 8. Lấy lại phiếu thu với đầy đủ thông tin
      const completePayment = await tx.phieuThuTien.findUnique({
        where: { maPhieuThu: payment.maPhieuThu },
        include: {
          khachHang: {
            select: {
              maKH: true,
              tenKH: true,
              soDienThoai: true,
              congNo: true
            }
          },
          hoaDon: {
            select: {
              maHoaDon: true,
              ngayLap: true,
              thanhTien: true,
              trangThai: true
            }
          }
        }
      });

      return {
        success: true,
        message: 'Lập phiếu thu tiền thành công',
        data: {
          payment: completePayment,
          debtBefore: currentDebt,
          debtAfter: newDebt,
          paidAmount: amount
        }
      };
    }, {
      maxWait: 5000,
      timeout: 10000
    });
  }

  /**
   * Kiểm tra quy định về giới hạn thu tiền
   * @param {Object} tx - Prisma transaction client
   * @returns {Promise<boolean>} True nếu sử dụng quy định
   */
  async checkPaymentLimitRegulation(tx) {
    const regulation = await tx.quyDinh.findFirst({
      where: { tenQuyDinh: 'GioiHanThuTien' }
    });

    // Mặc định là sử dụng quy định
    if (!regulation) return true;

    return regulation.giaTri === 'true' || regulation.giaTri === '1';
  }

  /**
   * Lấy thông tin phiếu thu theo ID
   * @param {number} paymentId - ID phiếu thu
   * @returns {Promise<Object>} Thông tin phiếu thu
   */
  async getPaymentById(paymentId) {
    const payment = await this.prisma.phieuThuTien.findUnique({
      where: { maPhieuThu: paymentId },
      include: {
        khachHang: {
          select: {
            maKH: true,
            tenKH: true,
            soDienThoai: true,
            diaChi: true,
            congNo: true
          }
        },
        hoaDon: {
          select: {
            maHoaDon: true,
            ngayLap: true,
            tongTien: true,
            tienGiamGia: true,
            thanhTien: true,
            trangThai: true
          }
        }
      }
    });

    if (!payment) {
      throw new NotFoundError('Không tìm thấy phiếu thu');
    }

    return payment;
  }

  /**
   * Lấy danh sách phiếu thu với filter và pagination
   * @param {Object} options - Tùy chọn lọc và phân trang
   * @returns {Promise<Object>} Danh sách phiếu thu
   */
  async getPayments(options = {}) {
    const {
      page = 1,
      limit = 10,
      customerId,
      employeeId,
      invoiceId,
      paymentMethod,
      fromDate,
      toDate,
      sortBy = 'ngayThu',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện where
    const where = {
      trangThai: 'ACTIVE' // Chỉ lấy phiếu thu chưa hủy
    };

    if (customerId) where.maKH = customerId;
    if (employeeId) where.maNV = employeeId;
    if (invoiceId) where.maHoaDon = invoiceId;
    if (paymentMethod) where.phuongThucThanhToan = paymentMethod;

    if (fromDate || toDate) {
      where.ngayThu = {};
      if (fromDate) where.ngayThu.gte = new Date(fromDate);
      if (toDate) where.ngayThu.lte = new Date(toDate);
    }

    // Đếm tổng số
    const total = await this.prisma.phieuThuTien.count({ where });

    // Lấy dữ liệu
    const payments = await this.prisma.phieuThuTien.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        khachHang: {
          select: {
            maKH: true,
            tenKH: true,
            soDienThoai: true
          }
        },
        hoaDon: {
          select: {
            maHoaDon: true,
            thanhTien: true,
            trangThai: true
          }
        }
      }
    });

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Lấy lịch sử thanh toán của khách hàng
   * @param {number} customerId - ID khách hàng
   * @returns {Promise<Object>} Lịch sử thanh toán
   */
  async getCustomerPaymentHistory(customerId) {
    // Kiểm tra khách hàng tồn tại
    const customer = await this.prisma.khachHang.findUnique({
      where: { maKH: customerId }
    });

    if (!customer) {
      throw new NotFoundError('Không tìm thấy khách hàng');
    }

    // Lấy danh sách phiếu thu
    const payments = await this.prisma.phieuThuTien.findMany({
      where: { 
        maKH: customerId,
        trangThai: 'ACTIVE'
      },
      orderBy: { ngayThu: 'desc' },
      include: {
        hoaDon: {
          select: {
            maHoaDon: true,
            thanhTien: true,
            trangThai: true
          }
        }
      }
    });

    // Lấy danh sách hóa đơn
    const invoices = await this.prisma.hoaDonBanSach.findMany({
      where: { 
        maKH: customerId,
        trangThai: { not: 'DA_HUY' }
      },
      orderBy: { ngayLap: 'desc' },
      select: {
        maHoaDon: true,
        ngayLap: true,
        thanhTien: true,
        trangThai: true
      }
    });

    // Tính tổng số liệu
    const totalInvoiceAmount = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.thanhTien || 0), 
      0
    );
    const totalPaidAmount = payments.reduce(
      (sum, pay) => sum + parseFloat(pay.soTienThu), 
      0
    );

    return {
      customer: {
        maKH: customer.maKH,
        tenKH: customer.tenKH,
        soDienThoai: customer.soDienThoai,
        congNo: customer.congNo
      },
      summary: {
        totalInvoiceAmount,
        totalPaidAmount,
        currentDebt: customer.congNo ? parseFloat(customer.congNo) : 0
      },
      payments,
      invoices
    };
  }

  /**
   * Hủy phiếu thu (trong vòng 24h)
   * @param {number} paymentId - ID phiếu thu
   * @param {number} employeeId - ID nhân viên thực hiện
   * @returns {Promise<Object>} Kết quả hủy
   */
  async cancelPayment(paymentId, employeeId) {
    return await this.prisma.$transaction(async (tx) => {
      // Kiểm tra phiếu thu tồn tại
      const payment = await tx.phieuThuTien.findUnique({
        where: { maPhieuThu: paymentId },
        include: {
          khachHang: true,
          hoaDon: true
        }
      });

      if (!payment) {
        throw new NotFoundError('Không tìm thấy phiếu thu');
      }

      if (payment.trangThai === 'CANCELLED') {
        throw new BusinessRuleError('Phiếu thu đã bị hủy trước đó');
      }

      // Kiểm tra thời gian (24h)
      const hoursSincePayment = (Date.now() - payment.ngayThu.getTime()) / (1000 * 60 * 60);
      if (hoursSincePayment > 24) {
        throw new BusinessRuleError('Chỉ được hủy phiếu thu trong vòng 24 giờ');
      }

      // Hoàn trả công nợ
      const paymentAmount = parseFloat(payment.soTienThu);
      await tx.khachHang.update({
        where: { maKH: payment.maKH },
        data: {
          congNo: {
            increment: paymentAmount
          }
        }
      });

      // Cập nhật trạng thái hóa đơn nếu có
      if (payment.maHoaDon) {
        // Lấy tất cả phiếu thu của hóa đơn (trừ phiếu đang hủy)
        const otherPayments = await tx.phieuThuTien.findMany({
          where: {
            maHoaDon: payment.maHoaDon,
            maPhieuThu: { not: paymentId },
            trangThai: 'ACTIVE'
          }
        });

        const totalPaid = otherPayments.reduce(
          (sum, p) => sum + parseFloat(p.soTienThu), 
          0
        );

        const invoiceFinalAmount = parseFloat(payment.hoaDon.thanhTien || 0);
        let newStatus = 'CHUA_THANH_TOAN';

        if (totalPaid >= invoiceFinalAmount) {
          newStatus = 'DA_THANH_TOAN';
        } else if (totalPaid > 0) {
          newStatus = 'THANH_TOAN_MOT_PHAN';
        }

        await tx.hoaDonBanSach.update({
          where: { maHoaDon: payment.maHoaDon },
          data: { trangThai: newStatus }
        });
      }

      // Cập nhật trạng thái phiếu thu
      const cancelledPayment = await tx.phieuThuTien.update({
        where: { maPhieuThu: paymentId },
        data: { trangThai: 'CANCELLED' }
      });

      return {
        success: true,
        message: 'Hủy phiếu thu thành công',
        data: {
          payment: cancelledPayment,
          refundedAmount: paymentAmount
        }
      };
    });
  }

  /**
   * Tính toán và kiểm tra công nợ của khách hàng
   * @param {number} customerId - ID khách hàng
   * @returns {Promise<Object>} Thông tin công nợ
   */
  async calculateCustomerDebt(customerId) {
    const customer = await this.prisma.khachHang.findUnique({
      where: { maKH: customerId },
      include: {
        hoadon: {
          where: { trangThai: { not: 'DA_HUY' } },
          select: {
            maHoaDon: true,
            thanhTien: true,
            trangThai: true,
            ngayLap: true
          }
        },
        phieuThu: {
          where: { trangThai: 'ACTIVE' },
          select: {
            maPhieuThu: true,
            soTienThu: true,
            ngayThu: true
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundError('Không tìm thấy khách hàng');
    }

    // Tính tổng tiền hóa đơn
    const totalInvoiceAmount = customer.hoadon.reduce(
      (sum, inv) => sum + parseFloat(inv.thanhTien || 0), 
      0
    );

    // Tính tổng tiền đã thu
    const totalPaidAmount = customer.phieuThu.reduce(
      (sum, pay) => sum + parseFloat(pay.soTienThu), 
      0
    );

    // Tính công nợ thực tế
    const calculatedDebt = totalInvoiceAmount - totalPaidAmount;
    const storedDebt = customer.congNo ? parseFloat(customer.congNo) : 0;

    // Lấy quy định nợ tối đa
    const maxDebtRegulation = await this.prisma.quyDinh.findFirst({
      where: { tenQuyDinh: 'NoToiDa' }
    });
    const maxDebtLimit = maxDebtRegulation 
      ? parseFloat(maxDebtRegulation.giaTri) 
      : 20000;

    return {
      customer: {
        maKH: customer.maKH,
        tenKH: customer.tenKH,
        soDienThoai: customer.soDienThoai
      },
      debt: {
        storedDebt,
        calculatedDebt,
        totalInvoiceAmount,
        totalPaidAmount,
        isConsistent: Math.abs(storedDebt - calculatedDebt) < 0.01
      },
      regulation: {
        maxDebtLimit,
        isOverLimit: storedDebt > maxDebtLimit,
        canPurchase: storedDebt <= maxDebtLimit
      },
      invoiceCount: customer.hoadon.length,
      paymentCount: customer.phieuThu.length
    };
  }
}

// Export both the class (for testing with mocks) and a default instance
module.exports = new PaymentService();
module.exports.PaymentService = PaymentService;
