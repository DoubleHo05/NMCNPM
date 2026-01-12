// controllers/salesController.js
const salesService = require('../services/salesService');
const { ValidationError } = require('../utils/errorTypes');

class SalesController {
  /**
   * POST /api/sales/invoices
   * Tạo hóa đơn bán hàng mới
   */
  async createInvoice(req, res, next) {
    try {
      const { customerId, items, discount, notes } = req.body;
      const employeeId = req.user.maNV; // Lấy từ JWT token (authMiddleware)

      // Validation cơ bản
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError('Danh sách sách không được rỗng');
      }

      // Validate từng item
      for (const item of items) {
        // isbn có thể là số (maSach) hoặc chuỗi (ISBN code)
        if (item.isbn === undefined || item.isbn === null || !item.quantity || item.quantity <= 0) {
          throw new ValidationError(
            `Dữ liệu sách không hợp lệ: ISBN=${item.isbn}, SL=${item.quantity}`
          );
        }
      }

      const invoiceData = {
        employeeId,
        customerId: customerId || null,
        items,
        discount: discount || 0
      };

      const result = await salesService.createInvoice(invoiceData);

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
   * GET /api/sales/invoices/:id
   * Lấy thông tin hóa đơn theo ID
   */
  async getInvoiceById(req, res, next) {
    try {
      const { id } = req.params;
      const invoiceId = parseInt(id);

      if (isNaN(invoiceId)) {
        throw new ValidationError('ID hóa đơn không hợp lệ');
      }

      const invoice = await salesService.getInvoiceById(invoiceId);

      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/sales/invoices
   * Lấy danh sách hóa đơn với filter và pagination
   */
  async getInvoices(req, res, next) {
    try {
      const {
        page,
        limit,
        customerId,
        employeeId,
        status,
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
        status,
        fromDate,
        toDate,
        sortBy,
        sortOrder
      };

      const result = await salesService.getInvoices(options);

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
   * DELETE /api/sales/invoices/:id
   * Hủy hóa đơn (trong vòng 24h)
   */
  async cancelInvoice(req, res, next) {
    try {
      const { id } = req.params;
      const invoiceId = parseInt(id);
      const employeeId = req.user.maNV;

      if (isNaN(invoiceId)) {
        throw new ValidationError('ID hóa đơn không hợp lệ');
      }

      const result = await salesService.cancelInvoice(invoiceId, employeeId);

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
   * POST /api/sales/calculate
   * Tính toán tổng tiền (dùng cho preview trước khi tạo hóa đơn)
   */
  async calculateTotal(req, res, next) {
    try {
      const { items, promotions } = req.body;

      if (!items || !Array.isArray(items)) {
        throw new ValidationError('Danh sách sách không hợp lệ');
      }

      const result = salesService.calculateTotal(items, promotions);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalesController();