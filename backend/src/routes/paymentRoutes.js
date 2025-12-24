// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

/**
 * @route   POST /api/payments
 * @desc    Lập phiếu thu tiền
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.post(
  '/',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['THU_NGAN', 'QUAN_LY']),
  paymentController.createPayment
);

/**
 * @route   GET /api/payments/:id
 * @desc    Lấy thông tin phiếu thu theo ID
 * @access  Private
 */
router.get(
  '/:id',
  authMiddleware.authenticate,
  paymentController.getPaymentById
);

/**
 * @route   GET /api/payments
 * @desc    Lấy danh sách phiếu thu (có filter, pagination)
 * @access  Private
 */
router.get(
  '/',
  authMiddleware.authenticate,
  paymentController.getPayments
);

/**
 * @route   GET /api/payments/customers/:customerId/history
 * @desc    Lấy lịch sử thanh toán của khách hàng
 * @access  Private
 */
router.get(
  '/customers/:customerId/history',
  authMiddleware.authenticate,
  paymentController.getCustomerPaymentHistory
);

/**
 * @route   GET /api/payments/customers/:customerId/debt
 * @desc    Tính toán và kiểm tra công nợ của khách hàng
 * @access  Private
 */
router.get(
  '/customers/:customerId/debt',
  authMiddleware.authenticate,
  paymentController.calculateCustomerDebt
);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Hủy phiếu thu (trong vòng 24h)
 * @access  Private (QUAN_LY)
 */
router.delete(
  '/:id',
  authMiddleware.authenticate,
  roleMiddleware.checkRole(['QUAN_LY']),
  paymentController.cancelPayment
);

module.exports = router;