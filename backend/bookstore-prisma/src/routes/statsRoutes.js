const express = require('express');
const router = express.Router();
const { getDashboardStats, getInventoryReport, getDebtReport } = require('../controllers/statsController');

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Báo cáo tồn kho (BM5.1)
router.get('/inventory', getInventoryReport);

// Báo cáo công nợ (BM5.2)
router.get('/debt', getDebtReport);

module.exports = router;
