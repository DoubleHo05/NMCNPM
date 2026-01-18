const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate AI insights from bookstore stats
 */
async function generateInsights(stats) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return [
                "📊 Dữ liệu thống kê đang được theo dõi",
                "Thêm GEMINI_API_KEY vào .env để bật AI Insights"
            ];
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Bạn là chuyên gia phân tích kinh doanh nhà sách. Hãy phân tích dữ liệu sau và đưa ra 3-4 insights ngắn gọn bằng tiếng Việt:

Dữ liệu:
- Doanh thu tháng này: ${stats.totalRevenue?.toLocaleString('vi-VN') || 0} VNĐ
- Tổng số sách: ${stats.totalBooks || 0}
- Tổng khách hàng: ${stats.totalCustomers || 0}
- Sách bán chạy nhất: ${stats.topBooks?.[0]?.title || 'Chưa có'}

Yêu cầu:
- Mỗi insight 1 dòng, ngắn gọn (tối đa 100 ký tự)
- Sử dụng emoji phù hợp
- Đưa ra nhận xét thực tế và hữu ích
- Không giải thích dài dòng

Format: Danh sách các insights, mỗi dòng một insight.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse insights from response
        const insights = text
            .split('\n')
            .filter(line => line.trim().length > 0 && !line.includes('Insight'))
            .map(line => line.trim().replace(/^[-*•]\s*/, ''))
            .filter(line => line.length > 0)
            .slice(0, 4);

        return insights.length > 0 ? insights : [
            "📊 Hệ thống đang phân tích dữ liệu",
            "💡 Insights sẽ được cập nhật sớm"
        ];

    } catch (error) {
        console.error('Error generating insights:', error);
        return [
            "⚠️ Không thể generate insights lúc này",
            "Vui lòng thử lại sau"
        ];
    }
}

/**
 * Predict next month revenue using AI
 */
async function predictRevenue(historicalData) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return {
                amount: 0,
                confidence: '0%',
                trend: 'neutral',
                explanation: 'Cần API key để dự đoán'
            };
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `Bạn là chuyên gia phân tích tài chính. Dựa trên dữ liệu doanh thu lịch sử, hãy dự đoán doanh thu tháng tới.

Dữ liệu lịch sử:
${JSON.stringify(historicalData, null, 2)}

Yêu cầu:
- Dự đoán số tiền cụ thể (VNĐ)
- Đánh giá độ tin cậy (%)
- Xu hướng: up/down/stable
- Giải thích ngắn gọn (1 câu)

Trả lời dưới dạng JSON:
{
  "amount": <số tiền>,
  "confidence": "<phần trăm>%",
  "trend": "up|down|stable",
  "explanation": "<giải thích ngắn>"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const prediction = JSON.parse(jsonMatch[0]);
            return prediction;
        }

        // Fallback prediction
        const avgRevenue = historicalData.reduce((sum, d) => sum + (d.revenue || 0), 0) / historicalData.length;
        return {
            amount: Math.round(avgRevenue * 1.05),
            confidence: '65%',
            trend: 'up',
            explanation: 'Dựa trên xu hướng trung bình'
        };

    } catch (error) {
        console.error('Error predicting revenue:', error);
        return {
            amount: 0,
            confidence: '0%',
            trend: 'neutral',
            explanation: 'Không thể dự đoán lúc này'
        };
    }
}

/**
 * Get trending books from Google Books API
 */
async function getTrendingBooks() {
    try {
        const axios = require('axios');

        // Popular Vietnamese book topics
        const topics = ['kinh doanh', 'kỹ năng', 'văn học', 'tâm lý'];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: randomTopic,
                langRestrict: 'vi',
                orderBy: 'newest',
                maxResults: 5
            }
        });

        const books = response.data.items || [];

        return books.map(item => ({
            title: item.volumeInfo.title,
            author: item.volumeInfo.authors?.[0] || 'Không rõ',
            isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || '',
            publisher: item.volumeInfo.publisher || '',
            publishYear: item.volumeInfo.publishedDate?.substring(0, 4) || '',
            imageUrl: item.volumeInfo.imageLinks?.thumbnail || '',
            description: item.volumeInfo.description?.substring(0, 200) || ''
        })).slice(0, 5);

    } catch (error) {
        console.error('Error fetching trending books:', error);
        return [];
    }
}

module.exports = {
    generateInsights,
    predictRevenue,
    getTrendingBooks
};
