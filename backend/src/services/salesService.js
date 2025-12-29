// services/salesService.js
const { PrismaClient } = require('@prisma/client');
const { 
  ValidationError, 
  BusinessRuleError, 
  NotFoundError,
  InsufficientStockError,
  DebtLimitExceededError 
} = require('../utils/errorTypes');

class SalesService {
  constructor(prismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }
  /**
   * Tạo hóa đơn bán hàng mới
   * @param {Object} invoiceData - Dữ liệu hóa đơn
   * @param {number} invoiceData.customerId - ID khách hàng (optional)
   * @param {number} invoiceData.employeeId - ID nhân viên thu ngân
   * @param {Array} invoiceData.items - Danh sách sách [{isbn, quantity, unitPrice}]
   * @param {number} invoiceData.discount - Giảm giá (optional, default 0)
   * @returns {Promise<Object>} Hóa đơn đã tạo
   */
  async createInvoice(invoiceData) {
    const { customerId, employeeId, items, discount = 0 } = invoiceData;

    // Validation cơ bản
    if (!employeeId) {
      throw new ValidationError('Mã nhân viên là bắt buộc');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Danh sách sách không được rỗng');
    }

    // Bắt đầu transaction để đảm bảo tính toàn vẹn dữ liệu
    return await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra nhân viên tồn tại và có quyền THU_NGAN
      const employee = await tx.employee.findUnique({
        where: { id: employeeId }
      });

      if (!employee) {
        throw new NotFoundError('Không tìm thấy nhân viên');
      }

      if (employee.role !== 'THU_NGAN' && employee.role !== 'QUAN_LY') {
        throw new BusinessRuleError('Chỉ thu ngân hoặc quản lý mới được lập hóa đơn');
      }

      if (!employee.isActive) {
        throw new BusinessRuleError('Tài khoản nhân viên đã bị khóa');
      }

      // 2. Kiểm tra khách hàng (nếu có) và quy định nợ (QĐ2)
      let customer = null;
      if (customerId) {
        customer = await tx.customer.findUnique({
          where: { id: customerId }
        });

        if (!customer) {
          throw new NotFoundError('Không tìm thấy khách hàng');
        }

        // Lấy quy định nợ tối đa
        const maxDebtRegulation = await tx.regulation.findUnique({
          where: { code: 'QD2_NO_TOI_DA' }
        });

        const maxDebtLimit = maxDebtRegulation 
          ? parseFloat(maxDebtRegulation.value) 
          : 20000;

        // Kiểm tra QĐ2: Chỉ bán cho khách hàng nợ không quá 20.000đ
        if (parseFloat(customer.currentDebt) > maxDebtLimit) {
          throw new DebtLimitExceededError(
            `Khách hàng đang nợ ${customer.currentDebt.toLocaleString()}đ, vượt quá mức cho phép (${maxDebtLimit.toLocaleString()}đ)`
          );
        }
      }

      // 3. Lấy quy định tồn tối thiểu sau khi bán (QĐ2)
      const minStockRegulation = await tx.regulation.findUnique({
        where: { code: 'QD2_TON_TOI_THIEU' }
      });

      const minStockAfterSale = minStockRegulation 
        ? parseInt(minStockRegulation.value) 
        : 20;

      // 4. Validate và chuẩn bị dữ liệu cho từng sách
      const validatedItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const { isbn, quantity, unitPrice } = item;

        // Validation item
        if (!isbn || !quantity || quantity <= 0) {
          throw new ValidationError(`Dữ liệu sách không hợp lệ: ISBN=${isbn}, SL=${quantity}`);
        }

        // Kiểm tra sách tồn tại
        const book = await tx.book.findUnique({
          where: { isbn }
        });

        if (!book) {
          throw new NotFoundError(`Không tìm thấy sách với ISBN: ${isbn}`);
        }

        // Kiểm tra tồn kho đủ để bán
        if (book.stockQuantity < quantity) {
          throw new InsufficientStockError(
            `Sách "${book.title}" chỉ còn ${book.stockQuantity} cuốn, không đủ để bán ${quantity} cuốn`
          );
        }

        // Kiểm tra QĐ2: Tồn kho sau khi bán phải >= 20
        const stockAfterSale = book.stockQuantity - quantity;
        if (stockAfterSale < minStockAfterSale) {
          throw new BusinessRuleError(
            `Sách "${book.title}" sau khi bán chỉ còn ${stockAfterSale} cuốn, ` +
            `không đạt tồn tối thiểu (${minStockAfterSale} cuốn). Vui lòng giảm số lượng bán.`
          );
        }

        // Sử dụng giá bán lẻ từ DB nếu không truyền unitPrice
        const finalUnitPrice = unitPrice || parseFloat(book.sellingPrice);
        const itemTotal = finalUnitPrice * quantity;

        validatedItems.push({
          isbn,
          quantity,
          unitPrice: finalUnitPrice,
          itemTotal,
          bookTitle: book.title,
          currentStock: book.stockQuantity
        });

        totalAmount += itemTotal;
      }

      // 5. Tính toán tổng tiền
      const discountAmount = discount || 0;
      const finalAmount = totalAmount - discountAmount;

      if (finalAmount < 0) {
        throw new ValidationError('Tổng tiền sau giảm giá không được âm');
      }

      // 6. Tạo hóa đơn
      const invoice = await tx.invoice.create({
        data: {
          customerId: customerId || null,
          employeeId,
          totalAmount,
          discount: discountAmount,
          finalAmount,
          status: 'UNPAID',
          issueDate: new Date()
        }
      });

      // 7. Tạo chi tiết hóa đơn và cập nhật tồn kho
      for (const item of validatedItems) {
        // Tạo chi tiết hóa đơn
        await tx.invoiceDetail.create({
          data: {
            invoiceId: invoice.id,
            isbn: item.isbn,
            quantity: item.quantity,
            unitPrice: item.unitPrice
          }
        });

        // Trừ tồn kho (Real-time inventory deduction)
        await tx.book.update({
          where: { isbn: item.isbn },
          data: {
            stockQuantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // 8. Cập nhật công nợ khách hàng (nếu có)
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            currentDebt: {
              increment: finalAmount
            }
          }
        });
      }

      // 9. Lấy lại hóa đơn với đầy đủ thông tin
      const completeInvoice = await tx.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          customer: true,
          employee: {
            select: {
              id: true,
              fullName: true,
              role: true
            }
          },
          invoiceDetails: {
            include: {
              book: {
                select: {
                  isbn: true,
                  title: true,
                  sellingPrice: true
                }
              }
            }
          }
        }
      });

      return {
        success: true,
        message: 'Tạo hóa đơn thành công',
        data: {
          invoice: completeInvoice,
          itemsSold: validatedItems.map(item => ({
            isbn: item.isbn,
            title: item.bookTitle,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.itemTotal,
            stockBefore: item.currentStock,
            stockAfter: item.currentStock - item.quantity
          }))
        }
      };
    }, {
      maxWait: 5000, // Thời gian chờ tối đa 5s
      timeout: 10000, // Timeout transaction sau 10s
      isolationLevel: 'Serializable' // Mức độ cô lập cao nhất
    });
  }

  /**
   * Lấy thông tin hóa đơn theo ID
   * @param {number} invoiceId - ID hóa đơn
   * @returns {Promise<Object>} Thông tin hóa đơn
   */
  async getInvoiceById(invoiceId) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        employee: {
          select: {
            id: true,
            fullName: true,
            role: true
          }
        },
        invoiceDetails: {
          include: {
            book: {
              select: {
                isbn: true,
                title: true,
                sellingPrice: true
              }
            }
          }
        },
        payments: true
      }
    });

    if (!invoice) {
      throw new NotFoundError('Không tìm thấy hóa đơn');
    }

    // Tính toán trạng thái thanh toán
    const totalPaid = invoice.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount), 
      0
    );
    const remainingAmount = parseFloat(invoice.finalAmount) - totalPaid;

    return {
      ...invoice,
      totalPaid,
      remainingAmount,
      isPaid: remainingAmount <= 0
    };
  }

  /**
   * Lấy danh sách hóa đơn với filter và pagination
   * @param {Object} options - Tùy chọn lọc và phân trang
   * @returns {Promise<Object>} Danh sách hóa đơn
   */
  async getInvoices(options = {}) {
    const {
      page = 1,
      limit = 10,
      customerId,
      employeeId,
      status,
      fromDate,
      toDate,
      sortBy = 'issueDate',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Xây dựng điều kiện where
    const where = {};

    if (customerId) where.customerId = customerId;
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    if (fromDate || toDate) {
      where.issueDate = {};
      if (fromDate) where.issueDate.gte = new Date(fromDate);
      if (toDate) where.issueDate.lte = new Date(toDate);
    }

    // Đếm tổng số
    const total = await this.prisma.invoice.count({ where });

    // Lấy dữ liệu
    const invoices = await this.prisma.invoice.findMany({
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
        _count: {
          select: {
            invoiceDetails: true,
            payments: true
          }
        }
      }
    });

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Hủy hóa đơn (chỉ được hủy trong vòng 24h và chưa thanh toán)
   * @param {number} invoiceId - ID hóa đơn
   * @param {number} employeeId - ID nhân viên thực hiện hủy
   * @returns {Promise<Object>} Kết quả hủy
   */
  async cancelInvoice(invoiceId, employeeId) {
    return await this.prisma.$transaction(async (tx) => {
      // Kiểm tra hóa đơn tồn tại
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          invoiceDetails: true,
          payments: true,
          customer: true
        }
      });

      if (!invoice) {
        throw new NotFoundError('Không tìm thấy hóa đơn');
      }

      // Kiểm tra hóa đơn đã thanh toán chưa
      if (invoice.payments.length > 0) {
        throw new BusinessRuleError('Không thể hủy hóa đơn đã có thanh toán');
      }

      // Kiểm tra thời gian (24h)
      const hoursSinceIssue = (Date.now() - invoice.issueDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceIssue > 24) {
        throw new BusinessRuleError('Chỉ được hủy hóa đơn trong vòng 24 giờ sau khi lập');
      }

      // Hoàn trả tồn kho
      for (const detail of invoice.invoiceDetails) {
        await tx.book.update({
          where: { isbn: detail.isbn },
          data: {
            stockQuantity: {
              increment: detail.quantity
            }
          }
        });
      }

      // Hoàn trả công nợ khách hàng (nếu có)
      if (invoice.customerId) {
        await tx.customer.update({
          where: { id: invoice.customerId },
          data: {
            currentDebt: {
              decrement: parseFloat(invoice.finalAmount)
            }
          }
        });
      }

      // Xóa hóa đơn (cascade sẽ xóa chi tiết)
      await tx.invoice.delete({
        where: { id: invoiceId }
      });

      return {
        success: true,
        message: 'Hủy hóa đơn thành công',
        data: {
          invoiceId,
          restoredItems: invoice.invoiceDetails.map(d => ({
            isbn: d.isbn,
            quantity: d.quantity
          }))
        }
      };
    });
  }

  /**
   * Tính tổng tiền và áp dụng khuyến mãi
   * @param {Array} items - Danh sách sách
   * @param {Object} promotions - Các chương trình khuyến mãi
   * @returns {Object} Chi tiết tính tiền
   */
  calculateTotal(items, promotions = {}) {
    let subtotal = 0;
    const itemDetails = [];

    for (const item of items) {
      const itemTotal = item.unitPrice * item.quantity;
      subtotal += itemTotal;

      itemDetails.push({
        isbn: item.isbn,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        itemTotal
      });
    }

    // Áp dụng giảm giá (nếu có)
    let discount = 0;
    if (promotions.discountPercent) {
      discount = (subtotal * promotions.discountPercent) / 100;
    } else if (promotions.discountAmount) {
      discount = promotions.discountAmount;
    }

    const total = subtotal - discount;

    return {
      subtotal,
      discount,
      total,
      items: itemDetails
    };
  }
}

// Export both the class (for testing with mocks) and a default instance
module.exports = new SalesService();
module.exports.SalesService = SalesService;