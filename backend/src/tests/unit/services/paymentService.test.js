// tests/unit/services/paymentService.test.js
const { PaymentService } = require('../../../services/paymentService');
const {
  ValidationError,
  BusinessRuleError,
  NotFoundError,
  PaymentExceedDebtError
} = require('../../../utils/errorTypes');

describe('PaymentService', () => {
  let paymentService;
  let mockPrisma;

  const mockEmployee = {
    id: 1,
    fullName: 'Nguyễn Văn A',
    role: 'THU_NGAN',
    isActive: true
  };

  const mockCustomer = {
    id: 1,
    fullName: 'Trần Thị B',
    phone: '0909123456',
    currentDebt: 50000
  };

  const mockInvoice = {
    id: 1,
    customerId: 1,
    finalAmount: 160000,
    status: 'UNPAID',
    payments: []
  };

  const validPaymentData = {
    customerId: 1,
    employeeId: 1,
    amount: 30000,
    paymentMethod: 'TIEN_MAT',
    invoiceId: 1
  };

  beforeEach(() => {
    mockPrisma = {
      $transaction: jest.fn(),
      customer: {
        findUnique: jest.fn()
      }
    };
    paymentService = new PaymentService(mockPrisma);
  });

  describe('createPayment', () => {
    test('TC16: Lập phiếu thu thành công', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { 
            findUnique: jest.fn().mockResolvedValue(mockCustomer),
            update: jest.fn()
          },
          regulation: { findUnique: jest.fn().mockResolvedValue({ code: 'QD4_SU_DUNG', value: 'true' }) },
          invoice: {
            findUnique: jest.fn().mockResolvedValue(mockInvoice),
            update: jest.fn()
          },
          payment: {
            create: jest.fn().mockResolvedValue({ id: 1, amount: 30000 }),
            findUnique: jest.fn().mockResolvedValue({
              id: 1,
              amount: 30000,
              customer: mockCustomer,
              employee: mockEmployee,
              invoice: mockInvoice
            })
          }
        };
        return callback(tx);
      });

      const result = await paymentService.createPayment(validPaymentData);

      expect(result.success).toBe(true);
      expect(result.data.debtBefore).toBe(50000);
      expect(result.data.debtAfter).toBe(20000);
    });

    test('TC17: Lập phiếu thu thất bại - Thiếu customerId', async () => {
      await expect(
        paymentService.createPayment({ ...validPaymentData, customerId: null })
      ).rejects.toThrow(ValidationError);
    });

    test('TC18: Lập phiếu thu thất bại - Số tiền <= 0', async () => {
      await expect(
        paymentService.createPayment({ ...validPaymentData, amount: -1000 })
      ).rejects.toThrow(ValidationError);
    });

    test('TC19: Lập phiếu thu thất bại - Hình thức thanh toán không hợp lệ', async () => {
      await expect(
        paymentService.createPayment({ ...validPaymentData, paymentMethod: 'BITCOIN' })
      ).rejects.toThrow(ValidationError);
    });

    test('TC20: Lập phiếu thu thất bại - Nhân viên không tồn tại', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          employee: { findUnique: jest.fn().mockResolvedValue(null) }
        };
        return callback(tx);
      });

      await expect(paymentService.createPayment(validPaymentData))
        .rejects.toThrow(NotFoundError);
    });

    test('TC21: Lập phiếu thu thất bại - Nhân viên không có quyền', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          employee: { findUnique: jest.fn().mockResolvedValue({ ...mockEmployee, role: 'THU_KHO' }) }
        };
        return callback(tx);
      });

      await expect(paymentService.createPayment(validPaymentData))
        .rejects.toThrow(BusinessRuleError);
    });

    test('TC22: Lập phiếu thu thất bại - Khách hàng không nợ', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { findUnique: jest.fn().mockResolvedValue({ ...mockCustomer, currentDebt: 0 }) }
        };
        return callback(tx);
      });

      await expect(paymentService.createPayment(validPaymentData))
        .rejects.toThrow(BusinessRuleError);
    });

    test('TC23: Lập phiếu thu thất bại - Vi phạm QĐ4 (Thu vượt nợ)', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { findUnique: jest.fn().mockResolvedValue(mockCustomer) },
          regulation: { findUnique: jest.fn().mockResolvedValue({ code: 'QD4_SU_DUNG', value: 'true' }) }
        };
        return callback(tx);
      });

      await expect(
        paymentService.createPayment({ ...validPaymentData, amount: 60000 })
      ).rejects.toThrow(PaymentExceedDebtError);
    });

    test('TC24: Lập phiếu thu thành công - Thu đúng bằng nợ', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { 
            findUnique: jest.fn().mockResolvedValue(mockCustomer),
            update: jest.fn()
          },
          regulation: { findUnique: jest.fn().mockResolvedValue({ code: 'QD4_SU_DUNG', value: 'true' }) },
          invoice: {
            findUnique: jest.fn().mockResolvedValue(mockInvoice),
            update: jest.fn()
          },
          payment: {
            create: jest.fn().mockResolvedValue({ id: 2, amount: 50000 }),
            findUnique: jest.fn().mockResolvedValue({
              id: 2,
              amount: 50000,
              customer: mockCustomer,
              employee: mockEmployee
            })
          }
        };
        return callback(tx);
      });

      const result = await paymentService.createPayment({ ...validPaymentData, amount: 50000 });

      expect(result.success).toBe(true);
      expect(result.data.debtAfter).toBe(0);
    });

    test('TC25: Lập phiếu thu thành công khi QĐ4 bị tắt', async () => {
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const tx = {
          employee: { findUnique: jest.fn().mockResolvedValue(mockEmployee) },
          customer: { 
            findUnique: jest.fn().mockResolvedValue(mockCustomer),
            update: jest.fn()
          },
          regulation: { findUnique: jest.fn().mockResolvedValue({ code: 'QD4_SU_DUNG', value: 'false' }) },
          invoice: {
            findUnique: jest.fn().mockResolvedValue(mockInvoice),
            update: jest.fn()
          },
          payment: {
            create: jest.fn().mockResolvedValue({ id: 3, amount: 60000 }),
            findUnique: jest.fn().mockResolvedValue({
              id: 3,
              amount: 60000,
              customer: mockCustomer,
              employee: mockEmployee
            })
          }
        };
        return callback(tx);
      });

      const result = await paymentService.createPayment({ ...validPaymentData, amount: 60000 });

      expect(result.success).toBe(true);
      expect(result.data.debtAfter).toBe(-10000);
    });
  });

  describe('calculateCustomerDebt', () => {
    test('TC29: Tính công nợ chính xác - Một hóa đơn chưa thanh toán', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({
        id: 1,
        fullName: 'Test Customer',
        currentDebt: 100000,
        invoices: [
          { id: 1, finalAmount: 100000, issueDate: new Date(), payments: [] }
        ]
      });

      const result = await paymentService.calculateCustomerDebt(1);

      expect(result.calculatedDebt).toBe(100000);
      expect(result.isMatched).toBe(true);
      expect(result.details.unpaidInvoicesCount).toBe(1);
    });

    test('TC30: Tính công nợ chính xác - Nhiều hóa đơn, một số đã thanh toán', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({
        id: 1,
        fullName: 'Test Customer',
        currentDebt: 150000,
        invoices: [
          { id: 1, finalAmount: 100000, issueDate: new Date(), payments: [{ amount: 50000 }] },
          { id: 2, finalAmount: 200000, issueDate: new Date(), payments: [{ amount: 100000 }] }
        ]
      });

      const result = await paymentService.calculateCustomerDebt(1);

      expect(result.calculatedDebt).toBe(150000);
      expect(result.isMatched).toBe(true);
      expect(result.details.unpaidInvoicesCount).toBe(2);
    });

    test('TC31: Phát hiện mismatch - DB không khớp với tính toán', async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({
        id: 1,
        fullName: 'Test Customer',
        currentDebt: 200000,
        invoices: [
          { id: 1, finalAmount: 100000, issueDate: new Date(), payments: [{ amount: 50000 }] }
        ]
      });

      const result = await paymentService.calculateCustomerDebt(1);

      expect(result.calculatedDebt).toBe(50000);
      expect(result.currentDebtInDb).toBe(200000);
      expect(result.isMatched).toBe(false);
    });
  });
});