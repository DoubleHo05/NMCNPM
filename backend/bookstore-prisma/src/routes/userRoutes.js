const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Tạm thời bỏ authentication để test
// router.use(authMiddleware);
// router.use(checkRole('QUAN_LY'));

// Change password route (requires authentication) - must be before /:id routes
const { authMiddleware: authMw } = require('../middleware/auth');
router.put('/change-password', authMw, userController.changePassword);

// Update current user profile (requires authentication)
router.put('/profile', authMw, userController.updateCurrentUserProfile);

// CRUD routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;
