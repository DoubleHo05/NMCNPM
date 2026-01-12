const express = require('express');
const router = express.Router();
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  getPaymentsByCustomer,
} = require('../controllers/paymentController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.get('/customer/:customerId', getPaymentsByCustomer);

// Protected routes - Cần quyền thủ ngân hoặc quản lý
router.post('/', authMiddleware, checkRole('QUAN_LY', 'THU_NGAN'), createPayment);

module.exports = router;
