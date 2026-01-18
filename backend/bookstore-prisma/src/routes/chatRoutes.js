const express = require('express');
const chatService = require('../services/chatService');

const router = express.Router();

// Chat with AI
router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng nhập tin nhắn'
            });
        }

        const reply = await chatService.chat(message);
        res.json({
            success: true,
            message: reply
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi xử lý tin nhắn'
        });
    }
});

// Get quick insights (alerts, recommendations)
router.get('/insights', async (req, res) => {
    try {
        const insights = await chatService.getQuickInsights();
        res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi lấy thông tin'
        });
    }
});

// Get alerts only
router.get('/alerts', async (req, res) => {
    try {
        const alerts = await chatService.getAlerts();
        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Alerts error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi lấy cảnh báo'
        });
    }
});

// Get import recommendations
router.get('/recommendations', async (req, res) => {
    try {
        const recommendations = await chatService.getImportRecommendations();
        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({
            success: false,
            error: 'Lỗi lấy đề xuất'
        });
    }
});

module.exports = router;
