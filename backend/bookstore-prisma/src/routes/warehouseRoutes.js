const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const { authMiddleware } = require('../middleware/auth');

// Warehouse Items Routes
router.get('/items', warehouseController.getWarehouseItems);
router.get('/items/:id', warehouseController.getWarehouseItemById);
router.put('/items/:id', warehouseController.updateWarehouseItem); // Bỏ auth

// Warehouse Imports Routes (Tạm thời bỏ auth để test)
router.get('/imports', warehouseController.getImports);
router.post('/imports', warehouseController.createImport);

// Warehouse Stats
router.get('/stats', warehouseController.getWarehouseStats);

module.exports = router;
