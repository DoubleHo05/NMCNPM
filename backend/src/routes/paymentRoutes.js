// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, checkRole } = require('../middlewares/auth');

/**
 * @route   POST /api/payments
 * @desc    Lập phiếu thu tiền
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.post(
  '/',
  authMiddleware,
  checkRole('THU_NGAN', 'QUAN_LY'),
  paymentController.createPayment
);

/**
 * @route   GET /api/payments
 * @desc    Lấy danh sách phiếu thu (có filter, pagination)
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.get(
  '/',
  authMiddleware,
  checkRole('THU_NGAN', 'QUAN_LY'),
  paymentController.getPayments
);

/**
 * @route   GET /api/payments/customers/:customerId/history
 * @desc    Lấy lịch sử thanh toán của khách hàng
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.get(
  '/customers/:customerId/history',
  authMiddleware,
  checkRole('THU_NGAN', 'QUAN_LY'),
  paymentController.getCustomerPaymentHistory
);

/**
 * @route   GET /api/payments/customers/:customerId/debt
 * @desc    Tính toán và kiểm tra công nợ của khách hàng
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.get(
  '/customers/:customerId/debt',
  authMiddleware,
  checkRole('THU_NGAN', 'QUAN_LY'),
  paymentController.calculateCustomerDebt
);

/**
 * @route   GET /api/payments/:id
 * @desc    Lấy thông tin phiếu thu theo ID
 * @access  Private (THU_NGAN, QUAN_LY)
 */
router.get(
  '/:id',
  authMiddleware,
  checkRole('THU_NGAN', 'QUAN_LY'),
  paymentController.getPaymentById
);

/**
 * @route   DELETE /api/payments/:id
 * @desc    Hủy phiếu thu (trong vòng 24h)
 * @access  Private (QUAN_LY)
 */
router.delete(
  '/:id',
  authMiddleware,
  checkRole('QUAN_LY'),
  paymentController.cancelPayment
);

module.exports = router;
