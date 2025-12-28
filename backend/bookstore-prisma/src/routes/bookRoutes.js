const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
  getPublishers,
  getAuthors,
} = require('../controllers/bookController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Public routes - Lấy danh sách sách (không cần đăng nhập)
router.get('/', getAllBooks);
router.get('/categories', getCategories);
router.get('/publishers', getPublishers);
router.get('/authors', getAuthors);
router.get('/:id', getBookById);

// Protected routes - Cần đăng nhập và quyền hạn
router.post('/', authMiddleware, checkRole('QUAN_LY', 'THU_KHO'), createBook);
router.put('/:id', authMiddleware, checkRole('QUAN_LY', 'THU_KHO'), updateBook);
router.delete('/:id', authMiddleware, checkRole('QUAN_LY'), deleteBook);

module.exports = router;
