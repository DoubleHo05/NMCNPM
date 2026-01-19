const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, deleteCategory, updateCategory } = require('../controllers/categoryController');

// Lấy tất cả thể loại
router.get('/', getAllCategories);

// Tạo thể loại mới
router.post('/', createCategory);

// Cập nhật thể loại
router.put('/:id', updateCategory);

// Xóa thể loại
router.delete('/:id', deleteCategory);

module.exports = router;
