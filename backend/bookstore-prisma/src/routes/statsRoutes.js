const express = require('express');
const router = express.Router();
const { getDashboardStats, getInventoryReport, getDebtReport, getRevenueReport, getAIInsights } = require('../controllers/statsController');

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Báo cáo tồn kho (BM5.1)
router.get('/inventory', getInventoryReport);

// Báo cáo công nợ (BM5.2)
router.get('/debt', getDebtReport);

// Báo cáo doanh thu
router.get('/revenue', getRevenueReport);

// AI Insights (NEW)
router.get('/ai-insights', getAIInsights);

module.exports = router;
