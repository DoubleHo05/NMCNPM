// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

/**
 * @route   POST /api/sales/invoices
 * @desc    Tạo hóa đơn bán hàng mới
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.post(
  '/invoices',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['THU_NGAN', 'QUAN_LY']),
  salesController.createInvoice
);

/**
 * @route   GET /api/sales/invoices/:id
 * @desc    Lấy thông tin hóa đơn theo ID
 * @access  Private
 */
router.get(
  '/invoices/:id',
  authMiddleware.authenticate,
  salesController.getInvoiceById
);

/**
 * @route   GET /api/sales/invoices
 * @desc    Lấy danh sách hóa đơn (có filter, pagination)
 * @access  Private
 */
router.get(
  '/invoices',
  authMiddleware.authenticate,
  salesController.getInvoices
);

/**
 * @route   DELETE /api/sales/invoices/:id
 * @desc    Hủy hóa đơn (trong vòng 24h)
 * @access  Private (QUAN_LY)
 */
router.delete(
  '/invoices/:id',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['QUAN_LY']),
  salesController.cancelInvoice
);

/**
 * @route   POST /api/sales/calculate
 * @desc    Tính toán tổng tiền (preview)
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.post(
  '/calculate',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['THU_NGAN', 'QUAN_LY']),
  salesController.calculateTotal
);

module.exports = router;