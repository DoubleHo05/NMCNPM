import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, BookOpen, AlertCircle } from 'lucide-react';
import { getAIInsights, AIInsights } from '../services/statsService';

export default function AIInsightsCard() {
    const [insights, setInsights] = useState<AIInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAIInsights();
            setInsights(data);
        } catch (err: any) {
            setError(err.message || 'Không thể tải AI insights');
            console.error('Error fetching AI insights:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchInsights, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={16} className="text-green-500" />;
            case 'down':
                return <TrendingDown size={16} className="text-red-500" />;
            default:
                return <Minus size={16} className="text-gray-500" />;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-purple-600 animate-pulse" size={24} />
                    <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-purple-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-purple-200 rounded animate-pulse w-1/2"></div>
                    <div className="h-4 bg-purple-200 rounded animate-pulse w-2/3"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-xl p-6 shadow-sm border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="text-red-600" size={20} />
                    <h3 className="text-lg font-bold text-red-900">Lỗi AI Insights</h3>
                </div>
                <p className="text-sm text-red-700">{error}</p>
            </div>
        );
    }

    if (!insights) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Insights */}
            <div className="lg:col-span-2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm border border-purple-100">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-purple-600" size={24} />
                    <h3 className="text-lg font-bold text-gray-900">AI Insights</h3>
                    <span className="ml-auto text-xs text-purple-600">
                        {new Date(insights.generatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <ul className="space-y-2">
                    {insights.insights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{insight}</span>
                        </li>
                    ))}
                </ul>

                {/* Revenue Prediction */}
                {insights.revenuePrediction.amount > 0 && (
                    <div className="mt-4 pt-4 border-t border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Dự đoán doanh thu tháng tới</p>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(insights.revenuePrediction.trend)}
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(insights.revenuePrediction.amount)}đ
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Độ tin cậy: {insights.revenuePrediction.confidence} • {insights.revenuePrediction.explanation}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Trending Books */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="text-blue-600" size={20} />
                    <h3 className="text-base font-bold text-gray-900">Sách Trending</h3>
                </div>

                {insights.trendingBooks.length > 0 ? (
                    <div className="space-y-3">
                        {insights.trendingBooks.slice(0, 3).map((book, idx) => (
                            <div key={idx} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                {book.imageUrl && (
                                    <img
                                        src={book.imageUrl}
                                        alt={book.title}
                                        className="w-12 h-16 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://via.placeholder.com/48x64?text=No+Image';
                                        }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {book.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 truncate">{book.author}</p>
                                    {book.isbn && (
                                        <p className="text-xs text-gray-400 font-mono mt-1">ISBN: {book.isbn}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Không có dữ liệu</p>
                )}
            </div>
        </div>
    );
}
