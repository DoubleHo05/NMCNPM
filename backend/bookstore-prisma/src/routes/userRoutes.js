const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Tạm thời bỏ authentication để test
// router.use(authMiddleware);
// router.use(checkRole('QUAN_LY'));

// CRUD routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/status', userController.updateUserStatus);

// Change password route (requires authentication)
const { authMiddleware: authMw } = require('../middleware/auth');
router.put('/change-password', authMw, userController.changePassword);

module.exports = router;
