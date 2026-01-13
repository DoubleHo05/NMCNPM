import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar, RefreshCw, Loader2 } from 'lucide-react';

interface RevenueSummary {
    totalInvoices: number;
    totalRevenue: number;
    avgOrderValue: number;
    startDate: string;
    endDate: string;
}

interface MonthlyRevenue {
    month: number;
    year: number;
    invoices: number;
    revenue: number;
}

interface TopProduct {
    id: string;
    title: string;
    quantitySold: number;
    revenue: number;
}

const RevenueReport: React.FC = () => {
    const [summary, setSummary] = useState<RevenueSummary | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:5000/api/stats/revenue?startDate=${year}-01-01&endDate=${year}-12-31`);
            const data = await response.json();

            if (data.success) {
                setSummary(data.data.summary);
                setMonthlyData(data.data.monthlyRevenue);
                setTopProducts(data.data.topProducts);
            } else {
                setError(data.message || 'Lỗi khi tải dữ liệu');
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [year]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

    const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Báo cáo Doanh thu</h2>
                    <p className="text-sm text-slate-500">Thống kê doanh thu theo thời gian</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <button
                        onClick={fetchData}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                        Làm mới
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <DollarSign size={20} />
                                <span className="text-xs opacity-90 font-medium">Tổng doanh thu</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(summary?.totalRevenue || 0)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <ShoppingCart size={20} />
                                <span className="text-xs opacity-90 font-medium">Số hóa đơn</span>
                            </div>
                            <p className="text-2xl font-bold">{summary?.totalInvoices || 0}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={20} />
                                <span className="text-xs opacity-90 font-medium">Giá trị TB/đơn</span>
                            </div>
                            <p className="text-2xl font-bold">{formatCurrency(summary?.avgOrderValue || 0)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Monthly Chart */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                                <BarChart3 size={18} />
                                Doanh thu theo tháng ({year})
                            </h3>
                            <div className="space-y-2">
                                {monthNames.map((name, idx) => {
                                    const monthData = monthlyData.find(m => m.month === idx + 1);
                                    const revenue = monthData?.revenue || 0;
                                    const percent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                                    return (
                                        <div key={idx} className="flex items-center gap-3">
                                            <span className="w-16 text-xs text-slate-600">{name}</span>
                                            <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="w-24 text-xs font-semibold text-slate-900 text-right">
                                                {formatCurrency(revenue)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Top 10 sản phẩm bán chạy</h3>
                            {topProducts.length === 0 ? (
                                <p className="text-slate-500 text-center py-4 text-sm">Chưa có dữ liệu bán hàng</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs text-slate-500 border-b">
                                                <th className="pb-2 font-medium">#</th>
                                                <th className="pb-2 font-medium">Tên sách</th>
                                                <th className="pb-2 font-medium text-right">SL</th>
                                                <th className="pb-2 font-medium text-right">Doanh thu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.map((product, idx) => (
                                                <tr key={product.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                    <td className="py-2 text-xs text-slate-500">{idx + 1}</td>
                                                    <td className="py-2 text-sm font-medium text-slate-900 truncate max-w-[200px]">{product.title}</td>
                                                    <td className="py-2 text-xs text-right font-medium">{product.quantitySold}</td>
                                                    <td className="py-2 text-xs text-right font-bold text-green-600">
                                                        {formatCurrency(product.revenue)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RevenueReport;
