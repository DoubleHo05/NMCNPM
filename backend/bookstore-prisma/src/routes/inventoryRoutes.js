const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

// Middleware xác thực có thể được thêm vào đây nếu cần (ví dụ: verifyToken, checkRole)

router.post('/import', inventoryController.importGoods);
router.get('/history', inventoryController.getImportHistory);
router.post('/update-stock', inventoryController.updateStock);

module.exports = router;
