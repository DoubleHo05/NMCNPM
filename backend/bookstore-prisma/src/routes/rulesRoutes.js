const express = require('express');
const router = express.Router();
const {
  getAllRules,
  updateRules,
  updateSingleRule,
} = require('../controllers/rulesController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public route - Lấy quy định
router.get('/', getAllRules);

// Protected routes - Cập nhật quy định (chỉ quản lý)
router.put('/', authMiddleware, checkRole('QUAN_LY'), updateRules);
router.put('/:id', authMiddleware, checkRole('QUAN_LY'), updateSingleRule);

module.exports = router;
