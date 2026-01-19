// tests/unit/services/salesService.test.js
const { SalesService } = require('../../../services/salesService');
const {
  ValidationError,
  BusinessRuleError,
  NotFoundError,
  InsufficientStockError,
  DebtLimitExceededError
} = require('../../../utils/errorTypes');

describe('SalesService', () => {
  let salesService;
  let mockPrisma;

  beforeEach(() => {
    // Create fresh mock for each test
    mockPrisma = {
      $transaction: jest.fn(),
      invoice: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn()
      }
    };
    
    salesService = new SalesService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    const mockEmployee = {
      id: 1,
      fullName: 'Nguyễn Văn A',
      username: 'thungan01',
      role: 'THU_NGAN',
      isActive: true
    };

    const mockCustomer = {
      id: 1,
      fullName: 'Trần Thị B',
      currentDebt: 5000,
      maxDebtLimit: 20000
    };

    const mockBook = {
      isbn: '978-0-13-468599-1',
      title: 'Đắc Nhân Tâm',
      sellingPrice: 80000,
      stockQuantity: 50
    };

    const validInvoiceData = {
      employeeId: 1,
      customerId: 1,
      items: [
        {
          isbn: '978-0-13-468599-1',
          quantity: 2,
          unitPrice: 80000
        }
      ],
      discount: 0
    };

    test('TC01: Tạo hóa đơn thành công - Khách hàng hợp lệ, tồn kho đủ', async () => {
      // Arrange
      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };
      const mockMinStockRegulation = { code: 'QD2_TON_TOI_THIEU', value: '20' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { 
            findUnique: jest.fn().mockResolvedValue(mockCustomer),
            update: jest.fn().mockResolvedValue({}) 
          },
          regulation: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockRegulation)
              .mockResolvedValueOnce(mockMinStockRegulation)
          },
          book: { 
            findUnique: jest.fn().mockResolvedValue(mockBook), 
            update: jest.fn().mockResolvedValue({ ...mockBook, stockQuantity: 48 })
          },
          invoice: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              totalAmount: 160000,
              discount: 0,
              finalAmount: 160000,
              status: 'UNPAID'
            }),
            findUnique: jest.fn().mockResolvedValue({
              id: 1,
              totalAmount: 160000,
              discount: 0,
              finalAmount: 160000,
              customer: mockCustomer,
              employee: mockEmployee,
              invoiceDetails: [
                {
                  isbn: '978-0-13-468599-1',
                  quantity: 2,
                  unitPrice: 80000,
                  book: mockBook
                }
              ]
            })
          },
          invoiceDetail: { create: jest.fn().mockResolvedValue({}) }
        };

        return await callback(txMock);
      });

      // Act
      const result = await salesService.createInvoice(validInvoiceData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Tạo hóa đơn thành công');
      expect(result.data.invoice.finalAmount).toBe(160000);
      expect(result.data.itemsSold).toHaveLength(1);
      expect(result.data.itemsSold[0].quantity).toBe(2);
      expect(result.data.itemsSold[0].stockAfter).toBe(48); // 50 - 2
    });

    test('TC02: Tạo hóa đơn thất bại - Thiếu employeeId', async () => {
      // Arrange
      const invalidData = { ...validInvoiceData, employeeId: null };

      // Act & Assert
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow(ValidationError);
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow('Mã nhân viên là bắt buộc');
    });

    test('TC03: Tạo hóa đơn thất bại - Danh sách sách rỗng', async () => {
      // Arrange
      const invalidData = { ...validInvoiceData, items: [] };

      // Act & Assert
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow(ValidationError);
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow('Danh sách sách không được rỗng');
    });

    test('TC04: Tạo hóa đơn thất bại - Nhân viên không tồn tại', async () => {
      // Arrange
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(null) }
        };
        return await callback(txMock);
      });

      // Act & Assert
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow(NotFoundError);
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow('Không tìm thấy nhân viên');
    });

    test('TC05: Tạo hóa đơn thất bại - Nhân viên không có quyền', async () => {
      // Arrange
      const invalidEmployee = { ...mockEmployee, role: 'THU_KHO' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(invalidEmployee) }
        };
        return await callback(txMock);
      });

      // Act & Assert
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow(BusinessRuleError);
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow('Chỉ thu ngân hoặc quản lý mới được lập hóa đơn');
    });

    test('TC06: Tạo hóa đơn thất bại - Khách hàng nợ quá giới hạn (QĐ2)', async () => {
      // Arrange
      const customerWithHighDebt = { ...mockCustomer, currentDebt: 25000 };
      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { findUnique: jest.fn().mockResolvedValue(customerWithHighDebt) },
          regulation: { findUnique: jest.fn().mockResolvedValue(mockRegulation) }
        };
        return await callback(txMock);
      });

      // Act & Assert
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow(DebtLimitExceededError);
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow(/vượt quá mức cho phép/);
    });

    test('TC07: Tạo hóa đơn thất bại - Không đủ tồn kho', async () => {
      // Arrange
      const bookLowStock = { ...mockBook, stockQuantity: 1 };
      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };
      const mockMinStockRegulation = { code: 'QD2_TON_TOI_THIEU', value: '20' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { findUnique: jest.fn().mockResolvedValue(mockCustomer) },
          regulation: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockRegulation)
              .mockResolvedValueOnce(mockMinStockRegulation)
          },
          book: { findUnique: jest.fn().mockResolvedValue(bookLowStock) }
        };
        return await callback(txMock);
      });

      // Act & Assert
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow(InsufficientStockError);
      await expect(salesService.createInvoice(validInvoiceData))
        .rejects
        .toThrow(/không đủ để bán/);
    });

    test('TC08: Tạo hóa đơn thất bại - Vi phạm QĐ2 tồn tối thiểu', async () => {
      // Arrange
      const bookWithStock = { ...mockBook, stockQuantity: 25 }; // Bán 2, còn 23 (>= 20)
      const invalidData = {
        ...validInvoiceData,
        items: [{ isbn: '978-0-13-468599-1', quantity: 10, unitPrice: 80000 }]
      };
      
      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };
      const mockMinStockRegulation = { code: 'QD2_TON_TOI_THIEU', value: '20' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { findUnique: jest.fn().mockResolvedValue(mockCustomer) },
          regulation: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockRegulation)
              .mockResolvedValueOnce(mockMinStockRegulation)
          },
          book: { findUnique: jest.fn().mockResolvedValue(bookWithStock) }
        };
        return await callback(txMock);
      });

      // Act & Assert
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow(BusinessRuleError);
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow(/không đạt tồn tối thiểu/);
    });

    test('TC09: Tạo hóa đơn thành công - Bán đúng tại ngưỡng tồn tối thiểu', async () => {
      // Arrange: Stock = 22, bán 2, còn 20 (đúng ngưỡng)
      const bookAtThreshold = { ...mockBook, stockQuantity: 22 };
      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };
      const mockMinStockRegulation = { code: 'QD2_TON_TOI_THIEU', value: '20' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { 
            findUnique: jest.fn().mockResolvedValue(mockCustomer),
            update: jest.fn() 
          },
          regulation: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockRegulation)
              .mockResolvedValueOnce(mockMinStockRegulation)
          },
          book: { findUnique: jest.fn().mockResolvedValue(bookAtThreshold), update: jest.fn() },
          invoice: {
            create: jest.fn().mockResolvedValue({
              id: 2,
              totalAmount: 160000,
              discount: 0,
              finalAmount: 160000,
              status: 'UNPAID'
            }),
            findUnique: jest.fn().mockResolvedValue({
              id: 2,
              invoiceDetails: [{
                isbn: '978-0-13-468599-1',
                quantity: 2,
                book: bookAtThreshold
              }]
            })
          },
          invoiceDetail: { create: jest.fn() }
        };
        return await callback(txMock);
      });

      // Act
      const result = await salesService.createInvoice(validInvoiceData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.itemsSold[0].stockAfter).toBe(20);
    });

    test('TC10: Tạo hóa đơn thành công - Khách hàng nợ đúng tại ngưỡng', async () => {
      // Arrange: Nợ = 20000, đúng ngưỡng tối đa
      const customerAtLimit = { ...mockCustomer, currentDebt: 20000 };
      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };
      const mockMinStockRegulation = { code: 'QD2_TON_TOI_THIEU', value: '20' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { 
            findUnique: jest.fn().mockResolvedValue(customerAtLimit),
            update: jest.fn() 
          },
          regulation: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockRegulation)
              .mockResolvedValueOnce(mockMinStockRegulation)
          },
          book: { findUnique: jest.fn().mockResolvedValue(mockBook), update: jest.fn() },
          invoice: {
            create: jest.fn().mockResolvedValue({ id: 3, finalAmount: 160000 }),
            findUnique: jest.fn().mockResolvedValue({
              id: 3,
              invoiceDetails: [{ isbn: '978-0-13-468599-1', quantity: 2, book: mockBook }]
            })
          },
          invoiceDetail: { create: jest.fn() }
        };
        return await callback(txMock);
      });

      // Act
      const result = await salesService.createInvoice(validInvoiceData);

      // Assert
      expect(result.success).toBe(true);
    });

    test('TC11: Tính tổng tiền chính xác với nhiều sách', async () => {
      // Arrange
      const multiItemData = {
        employeeId: 1,
        customerId: 1,
        items: [
          { isbn: '978-0-13-468599-1', quantity: 2, unitPrice: 80000 },
          { isbn: '978-0-06-112241-5', quantity: 1, unitPrice: 70000 }
        ],
        discount: 10000
      };

      const mockBook2 = {
        isbn: '978-0-06-112241-5',
        title: 'Nhà Giả Kim',
        sellingPrice: 70000,
        stockQuantity: 30
      };

      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };
      const mockMinStockRegulation = { code: 'QD2_TON_TOI_THIEU', value: '20' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { 
            findUnique: jest.fn().mockResolvedValue(mockCustomer),
            update: jest.fn() 
          },
          regulation: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockRegulation)
              .mockResolvedValueOnce(mockMinStockRegulation)
          },
          book: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockBook)
              .mockResolvedValueOnce(mockBook2),
            update: jest.fn()
          },
          invoice: {
            create: jest.fn().mockResolvedValue({
              id: 4,
              totalAmount: 230000, // 80000*2 + 70000*1
              discount: 10000,
              finalAmount: 220000, // 230000 - 10000
              status: 'UNPAID'
            }),
            findUnique: jest.fn().mockResolvedValue({
              id: 4,
              totalAmount: 230000,
              discount: 10000,
              finalAmount: 220000,
              invoiceDetails: [
                { isbn: '978-0-13-468599-1', quantity: 2, unitPrice: 80000, book: mockBook },
                { isbn: '978-0-06-112241-5', quantity: 1, unitPrice: 70000, book: mockBook2 }
              ]
            })
          },
          invoiceDetail: { create: jest.fn() }
        };
        return await callback(txMock);
      });

      // Act
      const result = await salesService.createInvoice(multiItemData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.invoice.totalAmount).toBe(230000);
      expect(result.data.invoice.discount).toBe(10000);
      expect(result.data.invoice.finalAmount).toBe(220000);
      expect(result.data.itemsSold).toHaveLength(2);
    });

    test('TC12: Tính tiền sai khi giảm giá lớn hơn tổng tiền', async () => {
      // Arrange
      const invalidData = {
        ...validInvoiceData,
        discount: 200000 // Lớn hơn tổng tiền 160000
      };

      const mockRegulation = { code: 'QD2_NO_TOI_DA', value: '20000' };
      const mockMinStockRegulation = { code: 'QD2_TON_TOI_THIEU', value: '20' };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { findUnique: jest.fn().mockResolvedValue(mockCustomer) },
          regulation: {
            findUnique: jest.fn()
              .mockResolvedValueOnce(mockRegulation)
              .mockResolvedValueOnce(mockMinStockRegulation)
          },
          book: { findUnique: jest.fn().mockResolvedValue(mockBook) }
        };
        return await callback(txMock);
      });

      // Act & Assert
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow(ValidationError);
      await expect(salesService.createInvoice(invalidData))
        .rejects
        .toThrow('Tổng tiền sau giảm giá không được âm');
    });
  });

  describe('calculateTotal', () => {
    test('TC13: Tính tổng tiền không có giảm giá', () => {
      // Arrange
      const items = [
        { isbn: 'A', quantity: 2, unitPrice: 100000 },
        { isbn: 'B', quantity: 1, unitPrice: 50000 }
      ];

      // Act
      const result = salesService.calculateTotal(items);

      // Assert
      expect(result.subtotal).toBe(250000);
      expect(result.discount).toBe(0);
      expect(result.total).toBe(250000);
    });

    test('TC14: Tính tổng tiền với giảm giá phần trăm', () => {
      // Arrange
      const items = [{ isbn: 'A', quantity: 1, unitPrice: 100000 }];
      const promotions = { discountPercent: 10 };

      // Act
      const result = salesService.calculateTotal(items, promotions);

      // Assert
      expect(result.subtotal).toBe(100000);
      expect(result.discount).toBe(10000);
      expect(result.total).toBe(90000);
    });

    test('TC15: Tính tổng tiền với giảm giá cố định', () => {
      // Arrange
      const items = [{ isbn: 'A', quantity: 1, unitPrice: 100000 }];
      const promotions = { discountAmount: 15000 };

      // Act
      const result = salesService.calculateTotal(items, promotions);

      // Assert
      expect(result.subtotal).toBe(100000);
      expect(result.discount).toBe(15000);
      expect(result.total).toBe(85000);
    });
  });
});