const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middlewares/auth');
const bookController = require('../controllers/bookController');

// Routes công khai (không cần đăng nhập) - Để tìm kiếm sách khi bán hàng
router.get('/', bookController.getAllBooks);
router.get('/categories', bookController.getCategories);
router.get('/publishers', bookController.getPublishers);
router.get('/authors', bookController.getAuthors);
router.get('/barcode/:code', bookController.getBookByBarcode);
router.get('/:id', bookController.getBookById);

// Routes yêu cầu đăng nhập với quyền THU_KHO hoặc QUAN_LY
router.post('/', authMiddleware, checkRole('THU_KHO', 'QUAN_LY'), bookController.createBook);
router.put('/:id', authMiddleware, checkRole('THU_KHO', 'QUAN_LY'), bookController.updateBook);
router.delete('/:id', authMiddleware, checkRole('QUAN_LY'), bookController.deleteBook);

module.exports = router;
