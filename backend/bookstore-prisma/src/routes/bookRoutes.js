const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authMiddleware } = require('../middleware/auth');

// Public routes (cho phép xem sách không cần đăng nhập nếu muốn, hoặc cần đăng nhập tùy nghiep vu)
// Ở đây giữ authMiddleware cho chắc chắn, hoặc bỏ nếu muốn khách xem được
router.get('/', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBookById);

module.exports = router;
