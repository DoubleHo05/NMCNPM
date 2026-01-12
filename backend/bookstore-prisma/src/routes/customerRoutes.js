const express = require('express');
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public routes - Lấy danh sách khách hàng
router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);

// Protected routes - Cần đăng nhập
router.post('/', authMiddleware, createCustomer);
router.put('/:id', authMiddleware, updateCustomer);
router.delete('/:id', authMiddleware, checkRole('QUAN_LY'), deleteCustomer);

module.exports = router;
