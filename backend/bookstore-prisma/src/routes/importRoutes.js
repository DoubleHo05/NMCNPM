const express = require('express');
const router = express.Router();
const {
  getAllImports,
  getImportById,
  createImport,
} = require('../controllers/importController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', getAllImports);
router.get('/:id', getImportById);

// Protected routes - Cần quyền thủ kho hoặc quản lý
router.post('/', authMiddleware, checkRole('QUAN_LY', 'THU_KHO'), createImport);

module.exports = router;
