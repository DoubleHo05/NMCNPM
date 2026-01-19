const { PrismaClient } = require('@prisma/client');
const { OpenRouter } = require('@openrouter/sdk');

const prisma = new PrismaClient();

// OpenRouter API keys - Load balancing
const OPENROUTER_CHATBOT_KEYS = [
    process.env.OPENROUTER_CHATBOT_KEY_1,
    process.env.OPENROUTER_CHATBOT_KEY_2,
    process.env.OPENROUTER_CHATBOT_KEY_3,
    process.env.OPENROUTER_CHATBOT_KEY_4,
    process.env.OPENROUTER_CHATBOT_KEY_5
].filter(key => key && !key.includes('your_openrouter'));

/**
 * Get store stats from database
 */
async function getStoreStats() {
    try {
        const totalBooks = await prisma.sach.count();
        const totalStock = await prisma.sach.aggregate({ _sum: { soLuongTon: true } });
        const totalCustomers = await prisma.khachHang.count();

        const lowStockBooks = await prisma.sach.findMany({
            where: { soLuongTon: { lt: 10 } },
            select: { tenSach: true, soLuongTon: true },
            take: 5
        });

        const bestSellers = await prisma.$queryRaw`
            SELECT s.TenSach, COALESCE(SUM(ct.SoLuongBan), 0) as totalSold
            FROM sach s
            LEFT JOIN chitiethoadon ct ON s.MaSach = ct.MaSach
            GROUP BY s.MaSach
            ORDER BY totalSold DESC
            LIMIT 5
        `;

        // Get total revenue
        const totalRevenue = await prisma.hoaDon.aggregate({
            _sum: { thanhTien: true }
        });

        // Get this month's revenue
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthlyRevenue = await prisma.hoaDon.aggregate({
            where: {
                ngayLap: { gte: firstDayOfMonth }
            },
            _sum: { thanhTien: true }
        });

        // Get total orders
        const totalOrders = await prisma.hoaDon.count();

        return {
            totalBooks,
            totalStock: totalStock._sum.soLuongTon || 0,
            totalCustomers,
            lowStockBooks,
            bestSellers,
            totalRevenue: totalRevenue._sum.thanhTien || 0,
            monthlyRevenue: monthlyRevenue._sum.thanhTien || 0,
            totalOrders
        };
    } catch (error) {
        console.error('Stats error:', error.message);
        return { totalBooks: 0, totalStock: 0, totalCustomers: 0, lowStockBooks: [], bestSellers: [], totalRevenue: 0, monthlyRevenue: 0, totalOrders: 0 };
    }
}


/**
 * Call OpenRouter API with key rotation
 */
async function callAI(prompt, context = '') {
    if (OPENROUTER_CHATBOT_KEYS.length === 0) {
        throw new Error('No OpenRouter API keys configured');
    }

    let lastError = null;

    // Try each key in sequence
    for (const apiKey of OPENROUTER_CHATBOT_KEYS) {
        try {
            const openrouter = new OpenRouter({ apiKey });

            const completion = await openrouter.chat.send({
                model: 'openai/gpt-oss-120b:free',
                messages: [
                    {
                        role: 'system',
                        content: context || 'Bạn là trợ lý AI nhà sách. QUAN TRỌNG: Chỉ trả lời ngắn gọn 1-2 câu bằng tiếng Việt. KHÔNG giải thích dài dòng. KHÔNG nói "để trả lời câu hỏi này...". Đi thẳng vào câu trả lời.'
                    },
                    { role: 'user', content: prompt }
                ],
                stream: false
            });

            const text = completion.choices?.[0]?.message?.content;
            if (text) {
                return text;
            }
        } catch (error) {
            lastError = error;
            // If rate limit or user error, try next key
            if (error.message?.includes('429') || error.message?.includes('rate limit') ||
                error.message?.includes('User not found') || error.message?.includes('401')) {
                console.log(`⏱️ API error on chatbot key, trying next...`);
                continue;
            }
            console.log(`⚠️ Chatbot error with key: ${error.message}`);
        }
    }

    throw new Error(lastError?.message || 'All API keys failed');
}

/**
 * Get alerts for dashboard
 */
async function getAlerts() {
    try {
        const alerts = [];

        // Check low stock
        const lowStock = await prisma.sach.count({
            where: { soLuongTon: { lt: 10 } }
        });
        if (lowStock > 0) {
            alerts.push({
                type: 'warning',
                message: `📦 ${lowStock} sách sắp hết hàng`,
                action: 'Xem danh sách'
            });
        }

        return alerts;
    } catch (error) {
        console.error('Alerts error:', error.message);
        return [];
    }
}

/**
 * Process chat message
 */
async function processChat(message) {
    try {
        // Detect intent
        const lowerMsg = message.toLowerCase();

        // Stats related
        if (lowerMsg.includes('kho') || lowerMsg.includes('tồn') || lowerMsg.includes('sách') ||
            lowerMsg.includes('thống kê') || lowerMsg.includes('bao nhiêu') || lowerMsg.includes('mấy')) {
            const stats = await getStoreStats();
            const bestSellerNames = stats.bestSellers.map(b => b.TenSach).slice(0, 3).join(', ');

            const prompt = `Dữ liệu: ${stats.totalBooks} đầu sách, ${stats.totalStock} cuốn tồn kho, ${stats.totalCustomers} khách hàng. Sách bán chạy: ${bestSellerNames}. 
Câu hỏi: ${message}
CHỈ trả lời 1 câu ngắn gọn, đi thẳng vào số liệu:`;
            return await callAI(prompt);
        }

        // General question
        return await callAI(message, 'Bạn là trợ lý AI nhà sách. Trả lời 1-2 câu ngắn gọn bằng tiếng Việt. Đi thẳng vào vấn đề.');

    } catch (error) {
        console.error('Chat error:', error.message);
        // Fallback response
        if (error.message?.includes('No OpenRouter')) {
            return `👋 Xin chào! Tôi là Sách Bot.\n\n⚠️ Cần cấu hình OpenRouter API keys trong .env để dùng AI!\n\nLấy key tại: https://openrouter.ai/keys`;
        }
        return `Xin lỗi, tôi gặp lỗi: ${error.message}. Vui lòng thử lại sau.`;
    }
}

module.exports = {
    processChat,
    chat: processChat, // alias for backwards compatibility
    getStoreStats,
    getAlerts
};
