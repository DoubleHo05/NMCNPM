const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Placeholder routes - sẽ được bổ sung sau
router.get('/', authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: 'Books API - Đang phát triển',
    data: []
  });
});

module.exports = router;
