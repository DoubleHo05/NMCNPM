import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { DollarSign, BookOpen, Users, TrendingUp, AlertTriangle, ShoppingCart, Package, CreditCard, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalBooks: number;
  totalStock: number;
  lowStockCount: number;
  totalCustomers: number;
  totalDebt: number;
  recentInvoices: number;
  todayRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topProducts: { id: string; title: string; author: string; price: number; imageUrl: string; soldQuantity: number }[];
}

const StatCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
    </div>
    <p className="text-xs font-medium text-slate-500 mb-0.5">{title}</p>
    <h3 className="text-lg font-bold text-slate-900">{value}</h3>
  </div>
);

const Dashboard: React.FC = () => {
  const { books, customers } = useStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats/dashboard');
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fallback calculations from context if API fails
  const totalStock = stats?.totalStock ?? books.reduce((sum, book) => sum + book.stock, 0);
  const totalDebt = stats?.totalDebt ?? customers.reduce((sum, cust) => sum + cust.currentDebt, 0);
  const lowStockBooks = stats?.lowStockCount ?? books.filter(b => b.stock < 50).length;
  const customerCount = stats?.totalCustomers ?? customers.length;

  // Use API data or fallback
  const chartData = stats?.monthlyRevenue?.map(m => ({
    name: m.month,
    sales: m.revenue
  })) || [];

  const topProducts = stats?.topProducts || [];

  const formatCurrency = (val: number) => val?.toLocaleString('vi-VN') || '0';

  return (
    <div className="space-y-4">
      {/* Stats Grid - 6 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          title="Tổng sách tồn"
          value={formatCurrency(totalStock)}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Loại sách"
          value={stats?.totalBooks || books.length}
          icon={BookOpen}
          color="bg-cyan-500"
        />
        <StatCard
          title="Khách hàng"
          value={customerCount}
          icon={Users}
          color="bg-purple-500"
        />
        <StatCard
          title="Sắp hết hàng"
          value={lowStockBooks}
          subtitle="< 50 cuốn"
          icon={AlertTriangle}
          color="bg-amber-500"
        />
        <StatCard
          title="Công nợ"
          value={`${formatCurrency(totalDebt)}đ`}
          icon={CreditCard}
          color="bg-rose-500"
        />
        <StatCard
          title="Doanh thu hôm nay"
          value={`${formatCurrency(stats?.todayRevenue || 0)}đ`}
          icon={DollarSign}
          color="bg-green-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Revenue Chart - Wider */}
        <div className="lg:col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Doanh thu theo tháng</h3>
            <span className="text-xs text-slate-400">{new Date().getFullYear()}</span>
          </div>
          <div className="h-64">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${formatCurrency(value)}đ`, 'Doanh thu']}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Books */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Sách bán chạy</h3>
            <ShoppingCart size={16} className="text-slate-400" />
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : topProducts.length > 0 ? (
              topProducts.slice(0, 5).map((book, idx) => (
                <div key={book.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="w-8 h-10 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{book.title}</p>
                    <p className="text-xs text-slate-500 truncate">{book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">{book.soldQuantity} đã bán</p>
                    <p className="text-xs text-slate-400">{formatCurrency(book.price)}đ</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm">
                Chưa có dữ liệu bán hàng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink href="/invoices/create" icon={ShoppingCart} label="Bán hàng" color="bg-green-500" />
        <QuickLink href="/import" icon={Package} label="Nhập sách" color="bg-blue-500" />
        <QuickLink href="/cash-collection" icon={CreditCard} label="Thu tiền" color="bg-purple-500" />
        <QuickLink href="/reports" icon={TrendingUp} label="Báo cáo" color="bg-orange-500" />
      </div>
    </div>
  );
};

const QuickLink = ({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) => (
  <a
    href={href}
    className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
  >
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <span className="font-medium text-slate-700">{label}</span>
  </a>
);

export default Dashboard;