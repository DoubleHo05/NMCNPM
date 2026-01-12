const express = require('express');
const router = express.Router();
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
} = require('../controllers/invoiceController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllInvoices);
router.get('/:id', getInvoiceById);

// Protected routes - Cần quyền thủ ngân hoặc quản lý
router.post('/', authMiddleware, checkRole('QUAN_LY', 'THU_NGAN'), createInvoice);

module.exports = router;
