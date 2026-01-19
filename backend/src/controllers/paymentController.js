// controllers/paymentController.js
const paymentService = require('../services/paymentService');
const { ValidationError } = require('../utils/errorTypes');

class PaymentController {
  /**
   * POST /api/payments
   * Lập phiếu thu tiền
   */
  async createPayment(req, res, next) {
    try {
      const { customerId, amount, paymentMethod, invoiceId, notes } = req.body;
      const employeeId = req.user.id; // Lấy từ JWT token

      // Validation
      if (!customerId) {
        throw new ValidationError('Mã khách hàng là bắt buộc');
      }

      if (!amount || amount <= 0) {
        throw new ValidationError('Số tiền thu phải lớn hơn 0');
      }

      if (!paymentMethod || !['TIEN_MAT', 'THE', 'CHUYEN_KHOAN'].includes(paymentMethod)) {
        throw new ValidationError('Hình thức thanh toán không hợp lệ');
      }

      const paymentData = {
        customerId: parseInt(customerId),
        employeeId,
        amount: parseFloat(amount),
        paymentMethod,
        invoiceId: invoiceId ? parseInt(invoiceId) : null,
        notes
      };

      const result = await paymentService.createPayment(paymentData);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/:id
   * Lấy thông tin phiếu thu theo ID
   */
  async getPaymentById(req, res, next) {
    try {
      const { id } = req.params;
      const paymentId = parseInt(id);

      if (isNaN(paymentId)) {
        throw new ValidationError('ID phiếu thu không hợp lệ');
      }

      const payment = await paymentService.getPaymentById(paymentId);

      res.status(200).json({
        success: true,
        data: payment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments
   * Lấy danh sách phiếu thu với filter và pagination
   */
  async getPayments(req, res, next) {
    try {
      const {
        page,
        limit,
        customerId,
        employeeId,
        invoiceId,
        paymentMethod,
        fromDate,
        toDate,
        sortBy,
        sortOrder
      } = req.query;

      const options = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        customerId: customerId ? parseInt(customerId) : undefined,
        employeeId: employeeId ? parseInt(employeeId) : undefined,
        invoiceId: invoiceId ? parseInt(invoiceId) : undefined,
        paymentMethod,
        fromDate,
        toDate,
        sortBy,
        sortOrder
      };

      const result = await paymentService.getPayments(options);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/customers/:customerId/history
   * Lấy lịch sử thanh toán của khách hàng
   */
  async getCustomerPaymentHistory(req, res, next) {
    try {
      const { customerId } = req.params;
      const customerIdInt = parseInt(customerId);

      if (isNaN(customerIdInt)) {
        throw new ValidationError('ID khách hàng không hợp lệ');
      }

      const history = await paymentService.getCustomerPaymentHistory(customerIdInt);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/payments/:id
   * Hủy phiếu thu (trong vòng 24h)
   */
  async cancelPayment(req, res, next) {
    try {
      const { id } = req.params;
      const paymentId = parseInt(id);
      const employeeId = req.user.id;

      if (isNaN(paymentId)) {
        throw new ValidationError('ID phiếu thu không hợp lệ');
      }

      const result = await paymentService.cancelPayment(paymentId, employeeId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payments/customers/:customerId/debt
   * Tính toán và kiểm tra công nợ của khách hàng
   */
  async calculateCustomerDebt(req, res, next) {
    try {
      const { customerId } = req.params;
      const customerIdInt = parseInt(customerId);

      if (isNaN(customerIdInt)) {
        throw new ValidationError('ID khách hàng không hợp lệ');
      }

      const debtInfo = await paymentService.calculateCustomerDebt(customerIdInt);

      res.status(200).json({
        success: true,
        data: debtInfo
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();