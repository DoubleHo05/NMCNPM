// services/salesService.js
const prisma = require('../config/database');
const { 
  ValidationError, 
  BusinessRuleError, 
  NotFoundError,
  InsufficientStockError,
  DebtLimitExceededError 
} = require('../utils/errorTypes');

class SalesService {
  constructor(prismaClient) {
    this.prisma = prismaClient || prisma;
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
      const employee = await tx.nhanVien.findUnique({
        where: { maNV: employeeId }
      });

      if (!employee) {
        throw new NotFoundError('Không tìm thấy nhân viên');
      }

      if (employee.vaiTro !== 'THU_NGAN' && employee.vaiTro !== 'QUAN_LY') {
        throw new BusinessRuleError('Chỉ thu ngân hoặc quản lý mới được lập hóa đơn');
      }

      if (!employee.trangThai) {
        throw new BusinessRuleError('Tài khoản nhân viên đã bị khóa');
      }

      // 2. Kiểm tra khách hàng (nếu có) và quy định nợ
      let customer = null;
      if (customerId) {
        customer = await tx.khachHang.findUnique({
          where: { maKH: customerId }
        });

        if (!customer) {
          throw new NotFoundError('Không tìm thấy khách hàng');
        }

        // Lấy quy định nợ tối đa
        const maxDebtRegulation = await tx.quyDinh.findFirst({
          where: { tenQuyDinh: 'NoToiDa' }
        });

        const maxDebtLimit = maxDebtRegulation 
          ? parseFloat(maxDebtRegulation.giaTri) 
          : 20000;

        // Kiểm tra: Chỉ bán cho khách hàng nợ không quá mức cho phép
        const currentDebt = customer.congNo ? parseFloat(customer.congNo) : 0;
        if (currentDebt > maxDebtLimit) {
          throw new DebtLimitExceededError(
            `Khách hàng đang nợ ${currentDebt.toLocaleString()}đ, vượt quá mức cho phép (${maxDebtLimit.toLocaleString()}đ)`
          );
        }
      }

      // 3. Lấy quy định tồn tối thiểu sau khi bán
      const minStockRegulation = await tx.quyDinh.findFirst({
        where: { tenQuyDinh: 'TonToiThieuSauBan' }
      });

      const minStockAfterSale = minStockRegulation 
        ? parseInt(minStockRegulation.giaTri) 
        : 20;

      // 4. Validate và chuẩn bị dữ liệu cho từng sách
      const validatedItems = [];
      let totalAmount = 0;

      for (const item of items) {
        const { isbn, quantity, unitPrice } = item;

        // Validation item
        if (isbn === undefined || isbn === null || !quantity || quantity <= 0) {
          throw new ValidationError(`Dữ liệu sách không hợp lệ: ISBN=${isbn}, SL=${quantity}`);
        }

        // Kiểm tra sách tồn tại (theo maSach nếu là number, hoặc ISBN nếu là string)
        let book;
        const isNumeric = typeof isbn === 'number' || (typeof isbn === 'string' && !isNaN(parseInt(isbn)) && /^\d+$/.test(isbn));
        
        if (isNumeric) {
          // Tìm theo maSach nếu là số
          const maSach = typeof isbn === 'number' ? isbn : parseInt(isbn);
          book = await tx.sach.findUnique({
            where: { maSach: maSach }
          });
        }
        
        // Nếu không tìm thấy theo maSach, thử tìm theo ISBN
        if (!book && typeof isbn === 'string') {
          book = await tx.sach.findFirst({
            where: { isbn: isbn }
          });
        }

        if (!book) {
          throw new NotFoundError(`Không tìm thấy sách với mã/ISBN: ${isbn}`);
        }

        const stockQuantity = book.soLuongTon || 0;

        // Kiểm tra tồn kho đủ để bán
        if (stockQuantity < quantity) {
          throw new InsufficientStockError(
            `Sách "${book.tenSach}" chỉ còn ${stockQuantity} cuốn, không đủ để bán ${quantity} cuốn`
          );
        }

        // Kiểm tra: Tồn kho sau khi bán phải >= tồn tối thiểu
        const stockAfterSale = stockQuantity - quantity;
        if (stockAfterSale < minStockAfterSale) {
          throw new BusinessRuleError(
            `Sách "${book.tenSach}" sau khi bán chỉ còn ${stockAfterSale} cuốn, ` +
            `không đạt tồn tối thiểu (${minStockAfterSale} cuốn). Vui lòng giảm số lượng bán.`
          );
        }

        // Sử dụng giá bán lẻ từ DB nếu không truyền unitPrice
        const finalUnitPrice = unitPrice || parseFloat(book.giaBanLe);
        const itemTotal = finalUnitPrice * quantity;

        validatedItems.push({
          maSach: book.maSach,
          isbn: book.isbn,
          quantity,
          unitPrice: finalUnitPrice,
          itemTotal,
          bookTitle: book.tenSach,
          currentStock: stockQuantity
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
      const invoice = await tx.hoaDonBanSach.create({
        data: {
          maKH: customerId || null,
          maNV: employeeId,
          tongTien: totalAmount,
          tienGiamGia: discountAmount,
          thanhTien: finalAmount,
          trangThai: 'CHUA_THANH_TOAN',
          ngayLap: new Date()
        }
      });

      // 7. Tạo chi tiết hóa đơn và cập nhật tồn kho
      for (const item of validatedItems) {
        // Tạo chi tiết hóa đơn
        await tx.chiTietHoaDon.create({
          data: {
            maHoaDon: invoice.maHoaDon,
            maSach: item.maSach,
            soLuongBan: item.quantity,
            giaBan: item.unitPrice,
            thanhTien: item.itemTotal
          }
        });

        // Trừ tồn kho
        await tx.sach.update({
          where: { maSach: item.maSach },
          data: {
            soLuongTon: {
              decrement: item.quantity
            }
          }
        });
      }

      // 8. Cập nhật công nợ khách hàng (nếu có)
      if (customerId) {
        await tx.khachHang.update({
          where: { maKH: customerId },
          data: {
            congNo: {
              increment: finalAmount
            }
          }
        });
      }

      // 9. Lấy lại hóa đơn với đầy đủ thông tin
      const completeInvoice = await tx.hoaDonBanSach.findUnique({
        where: { maHoaDon: invoice.maHoaDon },
        include: {
          khachHang: true,
          nhanVien: {
            select: {
              maNV: true,
              hoTen: true,
              vaiTro: true
            }
          },
          chiTiet: {
            include: {
              sach: {
                select: {
                  maSach: true,
                  isbn: true,
                  tenSach: true,
                  giaBanLe: true
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
            maSach: item.maSach,
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
      maxWait: 5000,
      timeout: 10000
    });
  }

  /**
   * Lấy thông tin hóa đơn theo ID
   * @param {number} invoiceId - ID hóa đơn
   * @returns {Promise<Object>} Thông tin hóa đơn
   */
  async getInvoiceById(invoiceId) {
    const invoice = await this.prisma.hoaDonBanSach.findUnique({
      where: { maHoaDon: invoiceId },
      include: {
        khachHang: true,
        nhanVien: {
          select: {
            maNV: true,
            hoTen: true,
            vaiTro: true
          }
        },
        chiTiet: {
          include: {
            sach: {
              select: {
                maSach: true,
                isbn: true,
                tenSach: true,
                giaBanLe: true
              }
            }
          }
        },
        phieuThu: true
      }
    });

    if (!invoice) {
      throw new NotFoundError('Không tìm thấy hóa đơn');
    }

    // Tính toán trạng thái thanh toán
    const totalPaid = invoice.phieuThu.reduce(
      (sum, payment) => sum + parseFloat(payment.soTienThu), 
      0
    );
    const remainingAmount = parseFloat(invoice.thanhTien || 0) - totalPaid;

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
      sortBy = 'ngayLap',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {};

    if (customerId) {
      where.maKH = customerId;
    }

    if (employeeId) {
      where.maNV = employeeId;
    }

    if (status) {
      where.trangThai = status;
    }

    if (fromDate || toDate) {
      where.ngayLap = {};
      if (fromDate) {
        where.ngayLap.gte = new Date(fromDate);
      }
      if (toDate) {
        where.ngayLap.lte = new Date(toDate);
      }
    }

    // Execute query
    const [invoices, total] = await Promise.all([
      this.prisma.hoaDonBanSach.findMany({
        where,
        include: {
          khachHang: {
            select: {
              maKH: true,
              tenKH: true,
              soDienThoai: true
            }
          },
          nhanVien: {
            select: {
              maNV: true,
              hoTen: true
            }
          },
          chiTiet: {
            select: {
              maCTHD: true,
              soLuongBan: true,
              giaBan: true,
              thanhTien: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      this.prisma.hoaDonBanSach.count({ where })
    ]);

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
   * Hủy hóa đơn (trong vòng 24h)
   * @param {number} invoiceId - ID hóa đơn
   * @param {number} employeeId - ID nhân viên thực hiện
   * @returns {Promise<Object>} Kết quả hủy
   */
  async cancelInvoice(invoiceId, employeeId) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra hóa đơn tồn tại
      const invoice = await tx.hoaDonBanSach.findUnique({
        where: { maHoaDon: invoiceId },
        include: {
          chiTiet: true,
          phieuThu: true
        }
      });

      if (!invoice) {
        throw new NotFoundError('Không tìm thấy hóa đơn');
      }

      // 2. Kiểm tra thời gian (chỉ hủy trong vòng 24h)
      const hoursSinceCreation = (Date.now() - new Date(invoice.ngayLap).getTime()) / (1000 * 60 * 60);
      if (hoursSinceCreation > 24) {
        throw new BusinessRuleError('Chỉ có thể hủy hóa đơn trong vòng 24 giờ');
      }

      // 3. Kiểm tra đã thanh toán chưa
      if (invoice.phieuThu && invoice.phieuThu.length > 0) {
        throw new BusinessRuleError('Không thể hủy hóa đơn đã có phiếu thu');
      }

      // 4. Hoàn lại tồn kho
      for (const detail of invoice.chiTiet) {
        await tx.sach.update({
          where: { maSach: detail.maSach },
          data: {
            soLuongTon: {
              increment: detail.soLuongBan
            }
          }
        });
      }

      // 5. Cập nhật công nợ khách hàng (nếu có)
      if (invoice.maKH) {
        await tx.khachHang.update({
          where: { maKH: invoice.maKH },
          data: {
            congNo: {
              decrement: parseFloat(invoice.thanhTien || 0)
            }
          }
        });
      }

      // 6. Cập nhật trạng thái hóa đơn
      const cancelledInvoice = await tx.hoaDonBanSach.update({
        where: { maHoaDon: invoiceId },
        data: {
          trangThai: 'DA_HUY'
        }
      });

      return {
        success: true,
        message: 'Hủy hóa đơn thành công',
        data: cancelledInvoice
      };
    });
  }

  /**
   * Tính toán tổng tiền (dùng cho preview)
   * @param {Array} items - Danh sách sách
   * @param {Object} promotions - Khuyến mãi (optional)
   * @returns {Object} Kết quả tính toán
   */
  calculateTotal(items, promotions = null) {
    if (!items || !Array.isArray(items)) {
      throw new ValidationError('Danh sách sách không hợp lệ');
    }

    let subtotal = 0;
    const calculatedItems = [];

    for (const item of items) {
      const { unitPrice, quantity } = item;
      const itemTotal = (unitPrice || 0) * (quantity || 0);
      subtotal += itemTotal;
      
      calculatedItems.push({
        ...item,
        itemTotal
      });
    }

    let discount = 0;
    if (promotions && promotions.discountPercent) {
      discount = subtotal * (promotions.discountPercent / 100);
    } else if (promotions && promotions.discountAmount) {
      discount = promotions.discountAmount;
    }

    const total = subtotal - discount;

    return {
      items: calculatedItems,
      subtotal,
      discount,
      total: Math.max(0, total)
    };
  }
}

// Export both the class (for testing with mocks) and a default instance
module.exports = new SalesService();
module.exports.SalesService = SalesService;
