const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const {
  getAllBooks,
  getBookById,
  searchBooks,
} = require('../controllers/bookController');

// Public routes - không cần đăng nhập để xem sách
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

module.exports = router;
