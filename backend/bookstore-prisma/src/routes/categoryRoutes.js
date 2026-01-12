const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../controllers/categoryController');

// Lấy tất cả thể loại
router.get('/', getAllCategories);

// Tạo thể loại mới
router.post('/', createCategory);

module.exports = router;
