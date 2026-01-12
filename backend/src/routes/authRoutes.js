const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/auth');

router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken); // Alias cho frontend
router.get('/me', authMiddleware, authController.getCurrentUser);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
