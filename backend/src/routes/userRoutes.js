const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middlewares/auth');
const userController = require('../controllers/userController');

// Tất cả routes yêu cầu đăng nhập
router.use(authMiddleware);

// Chỉ QUAN_LY mới được quản lý nhân viên
router.use(checkRole('QUAN_LY'));

// CRUD routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;
