const express = require('express');
const router = express.Router();
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const {
  getAllBooks,
  getBookById,
  searchBooks,
  updateBook,
} = require('../controllers/bookController');

// Public routes - không cần đăng nhập để xem sách
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Protected routes - cần đăng nhập
router.put('/:id', authMiddleware, updateBook);

module.exports = router;
