const { OpenRouter } = require('@openrouter/sdk');
const fs = require('fs');
const path = require('path');

// OpenRouter API keys - Load balancing
const OPENROUTER_INSIGHTS_KEYS = [
    process.env.OPENROUTER_INSIGHTS_KEY_1,
    process.env.OPENROUTER_INSIGHTS_KEY_2,
    process.env.OPENROUTER_INSIGHTS_KEY_3,
    process.env.OPENROUTER_INSIGHTS_KEY_4,
    process.env.OPENROUTER_INSIGHTS_KEY_5
].filter(key => key && !key.includes('your_openrouter'));

const OPENROUTER_CHATBOT_KEYS = [
    process.env.OPENROUTER_CHATBOT_KEY_1,
    process.env.OPENROUTER_CHATBOT_KEY_2,
    process.env.OPENROUTER_CHATBOT_KEY_3,
    process.env.OPENROUTER_CHATBOT_KEY_4,
    process.env.OPENROUTER_CHATBOT_KEY_5
].filter(key => key && !key.includes('your_openrouter'));

// Cache config
const CACHE_DIR = path.join(__dirname, '../../cache');
const INSIGHTS_CACHE = path.join(CACHE_DIR, 'insights-cache.json');
const TRENDING_CACHE = path.join(CACHE_DIR, 'trending-books.json');
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const TRENDING_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Ensure cache directory exists
 */
function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
}

/**
 * Load cache
 */
function loadCache(file, duration) {
    try {
        if (fs.existsSync(file)) {
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            if (data.timestamp && (Date.now() - data.timestamp) < duration) {
                return data;
            }
        }
    } catch (e) { }
    return null;
}

/**
 * Save cache
 */
function saveCache(file, data) {
    try {
        ensureCacheDir();
        fs.writeFileSync(file, JSON.stringify({ ...data, timestamp: Date.now() }, null, 2));
    } catch (e) { }
}

/**
 * Call OpenRouter API with key rotation for rate limit avoidance
 */
async function callOpenRouter(prompt, apiKeys) {
    if (!apiKeys || apiKeys.length === 0) {
        throw new Error('No API keys configured');
    }

    let lastError = null;

    // Try each key in sequence
    for (const apiKey of apiKeys) {
        try {
            const openrouter = new OpenRouter({ apiKey });

            const completion = await openrouter.chat.send({
                model: 'tngtech/deepseek-r1t2-chimera:free',
                messages: [
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
            // If rate limit (429), try next key
            if (error.message?.includes('429') || error.message?.includes('rate limit')) {
                console.log(`⏱️ Rate limit on key, trying next...`);
                continue;
            }
            // For other errors, also try next key
            console.log(`⚠️ Error with key: ${error.message}`);
        }
    }

    // All keys failed
    throw new Error(lastError?.message || 'All API keys failed');
}

/**
 * Generate smart insights from stats (fallback)
 */
function generateSmartInsights(stats) {
    const insights = [];

    if (stats.totalRevenue && Number(stats.totalRevenue) > 0) {
        insights.push(`💰 Tổng doanh thu: ${new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ`);
    }
    if (stats.totalBooks && Number(stats.totalBooks) > 0) {
        insights.push(`📚 Kho sách: ${Number(stats.totalBooks).toLocaleString()} cuốn`);
    }
    if (stats.totalCustomers && stats.totalCustomers > 0) {
        insights.push(`👥 ${stats.totalCustomers} khách hàng`);
    }
    if (stats.topBooks && stats.topBooks.length > 0) {
        insights.push(`🏆 Bán chạy: "${stats.topBooks[0].title}"`);
    }
    if (insights.length === 0) {
        insights.push(`📊 Đang theo dõi dữ liệu`);
    }

    return insights.slice(0, 4);
}

/**
 * Generate insights using OpenRouter AI with key rotation
 */
async function generateInsights(stats) {
    // Check cache first
    const cached = loadCache(INSIGHTS_CACHE, CACHE_DURATION);
    if (cached && cached.insights) {
        console.log('📦 Using cached insights');
        return cached.insights;
    }

    // Try OpenRouter API with key rotation
    if (OPENROUTER_INSIGHTS_KEYS.length > 0) {
        try {
            const prompt = `Phân tích dữ liệu nhà sách và đưa ra 4 insights ngắn gọn (mỗi dòng 1 insight, có emoji đầu dòng):
- Doanh thu: ${Number(stats.totalRevenue || 0).toLocaleString('vi-VN')}đ
- Số sách trong kho: ${stats.totalBooks || 0} cuốn
- Số khách hàng: ${stats.totalCustomers || 0}
- Sách bán chạy nhất: ${stats.topBooks?.[0]?.title || 'Chưa có dữ liệu'}

Chỉ trả về 4 dòng insight bằng tiếng Việt, mỗi dòng bắt đầu bằng emoji phù hợp.`;

            const response = await callOpenRouter(prompt, OPENROUTER_INSIGHTS_KEYS);
            const insights = response.split('\n')
                .filter(l => l.trim().length > 0 && l.trim().length < 100)
                .slice(0, 4);

            if (insights.length > 0) {
                saveCache(INSIGHTS_CACHE, { insights });
                console.log(`🤖 AI insights generated via OpenRouter (${OPENROUTER_INSIGHTS_KEYS.length} keys available)`);
                return insights;
            }
        } catch (error) {
            console.error('OpenRouter error:', error.message);
        }
    }

    // Fallback to smart insights
    console.log('📊 Using smart fallback insights');
    const insights = generateSmartInsights(stats);
    saveCache(INSIGHTS_CACHE, { insights });
    return insights;
}

/**
 * Calculate revenue prediction
 */
function calculateRevenuePrediction(historicalData) {
    if (!historicalData || historicalData.length === 0) {
        return { amount: 0, confidence: '0%', trend: 'neutral', explanation: 'Chưa có dữ liệu' };
    }

    const revenues = historicalData.map(d => Number(d.revenue) || 0);
    const avg = revenues.reduce((a, b) => a + b, 0) / revenues.length;

    let trend = 'stable';
    if (revenues.length >= 2) {
        const last = revenues[revenues.length - 1];
        const prev = revenues[revenues.length - 2];
        if (last > prev * 1.1) trend = 'up';
        else if (last < prev * 0.9) trend = 'down';
    }

    return {
        amount: Math.round(avg * (trend === 'up' ? 1.1 : trend === 'down' ? 0.95 : 1)),
        confidence: '70%',
        trend: trend,
        explanation: `Dựa trên ${revenues.length} tháng`
    };
}

/**
 * Get trending books using AI + database images
 */
async function getTrendingBooks(prisma) {
    const cached = loadCache(TRENDING_CACHE, TRENDING_DURATION);
    if (cached && cached.books) {
        console.log('📦 Using cached trending books');
        return cached.books;
    }

    // Default trending books with images from database
    let books = [
        { title: 'Mắt Biếc', author: 'Nguyễn Nhật Ánh', isbn: '9786041234567', image: 'https://cdn0.fahasa.com/media/catalog/product/m/a/mat-biec_bia-mem_1_2019_12_20_10_03_14.jpg' },
        { title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', isbn: '9786041234571', image: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935086840542.jpg' },
        { title: 'Nhà Giả Kim', author: 'Paulo Coelho', isbn: '9786041234572', image: 'https://cdn0.fahasa.com/media/catalog/product/n/h/nha-gia-kim-tai-ban-2020.jpg' },
        { title: 'Sapiens: Lược Sử Loài Người', author: 'Yuval Noah Harari', isbn: '9786041234584', image: 'https://cdn0.fahasa.com/media/catalog/product/s/a/sapiens.jpg' },
        { title: 'Muôn Kiếp Nhân Sinh', author: 'Nguyên Phong', isbn: '9786041234593', image: 'https://cdn0.fahasa.com/media/catalog/product/m/u/muon-kiep-nhan-sinh.jpg' }
    ];

    // Try to get AI recommendations
    if (OPENROUTER_INSIGHTS_KEYS.length > 0) {
        try {
            const prompt = `Bạn là chuyên gia sách. Hãy gợi ý 5 cuốn sách tiếng Việt đang thịnh hành nhất hiện nay.
Trả về định dạng JSON array với các field: title, author
Ví dụ: [{"title": "Mắt Biếc", "author": "Nguyễn Nhật Ánh"}]
Chỉ trả về JSON array, không có text khác.`;

            const response = await callOpenRouter(prompt, OPENROUTER_INSIGHTS_KEYS);

            // Try to parse JSON from response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const aiBooks = JSON.parse(jsonMatch[0]);
                if (Array.isArray(aiBooks) && aiBooks.length > 0) {
                    books = aiBooks.slice(0, 5).map(b => ({
                        title: b.title,
                        author: b.author,
                        isbn: '',
                        image: 'https://cdn0.fahasa.com/media/catalog/product/placeholder.jpg'
                    }));
                    console.log('🤖 Got AI trending recommendations');
                }
            }
        } catch (error) {
            console.log('⚠️ AI trending failed, using defaults:', error.message);
        }
    }

    // Try to get images from database if prisma available
    if (prisma) {
        try {
            for (let i = 0; i < books.length; i++) {
                const dbBook = await prisma.sach.findFirst({
                    where: { tenSach: { contains: books[i].title.split(':')[0].trim() } },
                    select: { hinhAnh: true, isbn: true }
                });
                if (dbBook) {
                    books[i].image = dbBook.hinhAnh || books[i].image;
                    books[i].isbn = dbBook.isbn || books[i].isbn;
                }
            }
            console.log('📚 Updated images from database');
        } catch (e) {
            console.log('⚠️ Could not fetch images from DB');
        }
    }

    saveCache(TRENDING_CACHE, { books });
    console.log('💾 Trending books cached');
    return books;
}

/**
 * Chat with OpenRouter AI (for chatbot) - Uses separate keys with rotation
 */
async function chat(message, context = '') {
    if (OPENROUTER_CHATBOT_KEYS.length === 0) {
        return 'Vui lòng cấu hình OPENROUTER_CHATBOT_KEY trong file .env để sử dụng chatbot AI.';
    }

    try {
        const prompt = `Bạn là trợ lý AI thông minh cho hệ thống quản lý nhà sách.
Nhiệm vụ: Hỗ trợ người dùng về quản lý sách, khách hàng, hóa đơn, báo cáo.
${context ? `Ngữ cảnh hiện tại: ${context}` : ''}

Câu hỏi: ${message}

Trả lời bằng tiếng Việt, ngắn gọn và hữu ích:`;

        const response = await callOpenRouter(prompt, OPENROUTER_CHATBOT_KEYS);
        return response || 'Xin lỗi, tôi không thể trả lời lúc này.';
    } catch (error) {
        console.error('OpenRouter chat error:', error.message);
        return 'Xin lỗi, tôi không thể trả lời lúc này. Vui lòng thử lại sau.';
    }
}

module.exports = {
    generateInsights,
    calculateRevenuePrediction,
    predictRevenue: calculateRevenuePrediction, // alias
    getTrendingBooks,
    chat,
    callOpenRouter
};
