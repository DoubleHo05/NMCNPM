const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middlewares/auth');
const settingsController = require('../controllers/settingsController');

// Routes công khai - lấy quy định để hiển thị
router.get('/rules', settingsController.getAllRules);
router.get('/rules/:name', settingsController.getRuleByName);

// Routes yêu cầu quyền QUAN_LY để chỉnh sửa
router.post('/rules', authMiddleware, checkRole('QUAN_LY'), settingsController.createRule);
router.put('/rules/:id', authMiddleware, checkRole('QUAN_LY'), settingsController.updateRule);
router.delete('/rules/:id', authMiddleware, checkRole('QUAN_LY'), settingsController.deleteRule);

module.exports = router;
