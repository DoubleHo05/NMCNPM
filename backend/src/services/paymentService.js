// services/paymentService.js
const { PrismaClient } = require('@prisma/client');
const { 
  ValidationError, 
  BusinessRuleError, 
  NotFoundError,
  PaymentExceedDebtError 
} = require('../utils/errorTypes');

class PaymentService {
  constructor(prismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }
  /**
   * Lập phiếu thu tiền
   * @param {Object} paymentData - Dữ liệu phiếu thu
   * @param {number} paymentData.customerId - ID khách hàng
   * @param {number} paymentData.employeeId - ID nhân viên thu tiền
   * @param {number} paymentData.amount - Số tiền thu
   * @param {string} paymentData.paymentMethod - Hình thức thanh toán (TIEN_MAT, THE, CHUYEN_KHOAN)
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

    if (!paymentMethod || !['TIEN_MAT', 'THE', 'CHUYEN_KHOAN'].includes(paymentMethod)) {
      throw new ValidationError('Hình thức thanh toán không hợp lệ');
    }

    // Bắt đầu transaction
    return await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra nhân viên tồn tại và có quyền thu tiền
      const employee = await tx.employee.findUnique({
        where: { id: employeeId }
      });

      if (!employee) {
        throw new NotFoundError('Không tìm thấy nhân viên');
      }

      if (employee.role !== 'THU_NGAN' && employee.role !== 'QUAN_LY') {
        throw new BusinessRuleError('Chỉ thu ngân hoặc quản lý mới được thu tiền');
      }

      if (!employee.isActive) {
        throw new BusinessRuleError('Tài khoản nhân viên đã bị khóa');
      }

      // 2. Kiểm tra khách hàng tồn tại và số nợ hiện tại
      const customer = await tx.customer.findUnique({
        where: { id: customerId }
      });

      if (!customer) {
        throw new NotFoundError('Không tìm thấy khách hàng');
      }

      const currentDebt = parseFloat(customer.currentDebt);

      // Kiểm tra khách hàng có nợ không
      if (currentDebt <= 0) {
        throw new BusinessRuleError('Khách hàng không có nợ cần thanh toán');
      }

      // 3. Kiểm tra QĐ4: Số tiền thu không vượt quá số tiền khách hàng đang nợ
      const usePaymentLimit = await this.checkPaymentLimitRegulation(tx);

      if (usePaymentLimit && amount > currentDebt) {
        throw new PaymentExceedDebtError(
          `Số tiền thu (${amount.toLocaleString()}đ) vượt quá số tiền nợ hiện tại (${currentDebt.toLocaleString()}đ)`
        );
      }

      // 4. Nếu có invoiceId, kiểm tra hóa đơn
      let invoice = null;
      if (invoiceId) {
        invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
          include: {
            payments: true
          }
        });

        if (!invoice) {
          throw new NotFoundError('Không tìm thấy hóa đơn');
        }

        if (invoice.customerId !== customerId) {
          throw new BusinessRuleError('Hóa đơn không thuộc về khách hàng này');
        }

        // Tính số tiền đã thanh toán cho hóa đơn này
        const totalPaid = invoice.payments.reduce(
          (sum, p) => sum + parseFloat(p.amount), 
          0
        );
        const invoiceRemaining = parseFloat(invoice.finalAmount) - totalPaid;

        // Cảnh báo nếu thanh toán quá số tiền hóa đơn
        if (amount > invoiceRemaining) {
          throw new BusinessRuleError(
            `Số tiền thu vượt quá số tiền còn lại của hóa đơn (${invoiceRemaining.toLocaleString()}đ)`
          );
        }
      }

      // 5. Tạo phiếu thu
      const payment = await tx.payment.create({
        data: {
          customerId,
          employeeId,
          amount,
          paymentMethod,
          invoiceId,
          notes,
          paymentDate: new Date()
        }
      });

      // 6. Cập nhật công nợ khách hàng
      const newDebt = currentDebt - amount;
      await tx.customer.update({
        where: { id: customerId },
        data: {
          currentDebt: newDebt
        }
      });

      // 7. Cập nhật trạng thái hóa đơn (nếu có)
      if (invoiceId && invoice) {
        const totalPaid = invoice.payments.reduce(
          (sum, p) => sum + parseFloat(p.amount), 
          0
        ) + amount;

        const invoiceFinalAmount = parseFloat(invoice.finalAmount);
        let newStatus = 'UNPAID';

        if (totalPaid >= invoiceFinalAmount) {
          newStatus = 'PAID';
        } else if (totalPaid > 0) {
          newStatus = 'PARTIALLY_PAID';
        }

        await tx.invoice.update({
          where: { id: invoiceId },
          data: { status: newStatus }
        });
      }

      // 8. Lấy lại phiếu thu với đầy đủ thông tin
      const completePayment = await tx.payment.findUnique({
        where: { id: payment.id },
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              currentDebt: true
            }
          },
          employee: {
            select: {
              id: true,
              fullName: true,
              role: true
            }
          },
          invoice: {
            select: {
              id: true,
              issueDate: true,
              finalAmount: true,
              status: true
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
      timeout: 10000,
      isolationLevel: 'Serializable'
    });
  }

  /**
   * Kiểm tra quy định về giới hạn thu tiền (QĐ4)
   * @param {Object} tx - Prisma transaction client
   * @returns {Promise<boolean>} True nếu sử dụng quy định
   */
  async checkPaymentLimitRegulation(tx) {
    const regulation = await tx.regulation.findUnique({
      where: { code: 'QD4_SU_DUNG' }
    });

    // Mặc định là sử dụng quy định
    if (!regulation) return true;

    return regulation.value === 'true' || regulation.value === '1';
  }

  /**
   * Lấy thông tin phiếu thu theo ID
   * @param {number} paymentId - ID phiếu thu
   * @returns {Promise<Object>} Thông tin phiếu thu
   */
  async getPaymentById(paymentId) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            address: true,
            currentDebt: true
          }
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        },
        invoice: {
          select: {
            id: true,
            issueDate: true,
            totalAmount: true,
            discount: true,
            finalAmount: true,
            status: true
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
      sortBy = 'paymentDate',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện where
    const where = {};

    if (customerId) where.customerId = customerId;
    if (employeeId) where.employeeId = employeeId;
    if (invoiceId) where.invoiceId = invoiceId;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (fromDate || toDate) {
      where.paymentDate = {};
      if (fromDate) where.paymentDate.gte = new Date(fromDate);
      if (toDate) where.paymentDate.lte = new Date(toDate);
    }

    // Đếm tổng số
    const total = await this.prisma.payment.count({ where });

    // Lấy dữ liệu
    const payments = await this.prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        },
        employee: {
          select: {
            id: true,
            fullName: true
          }
        },
        invoice: {
          select: {
            id: true,
            finalAmount: true,
            status: true
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
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: {
            employee: {
              select: {
                fullName: true
              }
            },
            invoice: {
              select: {
                id: true,
                issueDate: true,
                finalAmount: true
              }
            }
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundError('Không tìm thấy khách hàng');
    }

    // Tính tổng đã thanh toán
    const totalPaid = customer.payments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 
      0
    );

    return {
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address,
        currentDebt: customer.currentDebt,
        maxDebtLimit: customer.maxDebtLimit
      },
      paymentHistory: customer.payments,
      summary: {
        totalPayments: customer.payments.length,
        totalPaid,
        currentDebt: parseFloat(customer.currentDebt)
      }
    };
  }

  /**
   * Hủy phiếu thu (chỉ trong vòng 24h)
   * @param {number} paymentId - ID phiếu thu
   * @param {number} employeeId - ID nhân viên thực hiện hủy
   * @returns {Promise<Object>} Kết quả hủy
   */
  async cancelPayment(paymentId, employeeId) {
    return await this.prisma.$transaction(async (tx) => {
      // Kiểm tra phiếu thu tồn tại
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          customer: true,
          invoice: true
        }
      });

      if (!payment) {
        throw new NotFoundError('Không tìm thấy phiếu thu');
      }

      // Kiểm tra thời gian (24h)
      const hoursSincePayment = (Date.now() - payment.paymentDate.getTime()) / (1000 * 60 * 60);
      if (hoursSincePayment > 24) {
        throw new BusinessRuleError('Chỉ được hủy phiếu thu trong vòng 24 giờ');
      }

      // Hoàn trả công nợ khách hàng
      await tx.customer.update({
        where: { id: payment.customerId },
        data: {
          currentDebt: {
            increment: parseFloat(payment.amount)
          }
        }
      });

      // Cập nhật lại trạng thái hóa đơn (nếu có)
      if (payment.invoiceId) {
        const invoice = payment.invoice;
        const allPayments = await tx.payment.findMany({
          where: { 
            invoiceId: payment.invoiceId,
            id: { not: paymentId } // Không tính phiếu thu đang hủy
          }
        });

        const totalPaid = allPayments.reduce(
          (sum, p) => sum + parseFloat(p.amount), 
          0
        );

        const invoiceFinalAmount = parseFloat(invoice.finalAmount);
        let newStatus = 'UNPAID';

        if (totalPaid >= invoiceFinalAmount) {
          newStatus = 'PAID';
        } else if (totalPaid > 0) {
          newStatus = 'PARTIALLY_PAID';
        }

        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: newStatus }
        });
      }

      // Xóa phiếu thu
      await tx.payment.delete({
        where: { id: paymentId }
      });

      return {
        success: true,
        message: 'Hủy phiếu thu thành công',
        data: {
          paymentId,
          refundedAmount: parseFloat(payment.amount),
          customerId: payment.customerId
        }
      };
    });
  }

  /**
   * Tính toán công nợ của khách hàng
   * @param {number} customerId - ID khách hàng
   * @returns {Promise<Object>} Thông tin công nợ chi tiết
   */
  async calculateCustomerDebt(customerId) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        invoices: {
          include: {
            payments: true
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundError('Không tìm thấy khách hàng');
    }

    // Tính tổng các hóa đơn
    let totalInvoiceAmount = 0;
    let totalPaid = 0;
    const unpaidInvoices = [];

    for (const invoice of customer.invoices) {
      const invoiceAmount = parseFloat(invoice.finalAmount);
      totalInvoiceAmount += invoiceAmount;

      const invoicePaid = invoice.payments.reduce(
        (sum, p) => sum + parseFloat(p.amount), 
        0
      );
      totalPaid += invoicePaid;

      const remaining = invoiceAmount - invoicePaid;
      if (remaining > 0) {
        unpaidInvoices.push({
          invoiceId: invoice.id,
          issueDate: invoice.issueDate,
          amount: invoiceAmount,
          paid: invoicePaid,
          remaining
        });
      }
    }

    const calculatedDebt = totalInvoiceAmount - totalPaid;

    return {
      customerId,
      customerName: customer.fullName,
      currentDebtInDb: parseFloat(customer.currentDebt),
      calculatedDebt,
      isMatched: Math.abs(parseFloat(customer.currentDebt) - calculatedDebt) < 0.01,
      details: {
        totalInvoices: customer.invoices.length,
        totalInvoiceAmount,
        totalPaid,
        unpaidInvoicesCount: unpaidInvoices.length,
        unpaidInvoices
      }
    };
  }
}

// Export both the class (for testing with mocks) and a default instance
module.exports = new PaymentService();
module.exports.PaymentService = PaymentService;