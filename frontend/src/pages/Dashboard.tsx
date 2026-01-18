import React, { useEffect, useState } from 'react';
import { DollarSign, BookOpen, Users, TrendingUp, TrendingDown, AlertTriangle, Receipt, CreditCard, Award, ShoppingCart, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { getDashboardStats, type DashboardStats } from '../services/statsService';
import AIInsightsCard from '../components/AIInsightsCard';

// UI/UX Pro Max: Professional color palette
const COLORS = {
  primary: '#0F172A',
  secondary: '#334155',
  cta: '#0369A1',
  background: '#F8FAFC',
  text: '#020617',
  border: '#E2E8F0',
  profit: '#22C55E',
  loss: '#EF4444',
  neutral: '#64748B',
  trust: '#003366',
};

// UI/UX Pro Max: Chart colors with good contrast
const CHART_COLORS = ['#0369A1', '#7C3AED', '#DB2777', '#EA580C', '#059669'];

// UI/UX Pro Max: Bento Box Grid Card Component
const BentoCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'bg-white',
  textColor = 'text-slate-900',
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-600',
  subtitle,
  size = 'normal',
  className = ''
}: any) => (
  <div className={`
    ${color} rounded-2xl border border-slate-200 shadow-sm 
    hover:shadow-md hover:border-slate-300 transition-all duration-200 
    cursor-pointer p-5
    ${size === 'large' ? 'col-span-2' : ''}
    ${className}
  `}>
    <div className="flex items-start justify-between mb-3">
      <div className={`${iconBg} p-2.5 rounded-xl`}>
        <Icon size={20} className={iconColor} />
      </div>
      {trend !== undefined && trend !== 0 && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
          {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${textColor} tracking-tight`}>{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  </div>
);

// UI/UX Pro Max: Compact list item
const RankingItem = ({ rank, avatar, title, subtitle, value, valueColor = 'text-slate-900', valueSubtext }: any) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rank === 1 ? 'bg-amber-100 text-amber-700' :
      rank === 2 ? 'bg-slate-200 text-slate-600' :
        rank === 3 ? 'bg-orange-100 text-orange-700' :
          'bg-slate-100 text-slate-500'
      }`}>
      {rank}
    </div>
    {avatar}
    <div className="flex-1 min-w-0">
      <p className="font-medium text-slate-800 text-sm truncate group-hover:text-slate-900">{title}</p>
      <p className="text-xs text-slate-400 truncate">{subtitle}</p>
    </div>
    <div className="text-right">
      <p className={`font-semibold text-sm ${valueColor}`}>{value}</p>
      {valueSubtext && <p className="text-xs text-slate-400">{valueSubtext}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-[1800px] mx-auto">
          <div className="text-lg text-red-600">Lỗi tải dữ liệu</div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Prepare pie chart data
  const pieData = stats.topBooks.slice(0, 5).map((book, idx) => ({
    name: book.title.length > 15 ? book.title.substring(0, 15) + '...' : book.title,
    value: book.totalSold,
    color: CHART_COLORS[idx]
  }));

  const totalBooksSold = stats.topBooks.reduce((sum, b) => sum + b.totalSold, 0);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Tổng quan hoạt động kinh doanh</p>
        </div>

        {/* AI Insights Section */}
        <div className="mb-4">
          <AIInsightsCard />
        </div>

        {/* Row 1: Bento Grid - Main KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
          <BentoCard
            title="Tổng doanh thu"
            value={`${formatCurrency(stats.totalRevenue)}đ`}
            icon={DollarSign}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            subtitle="Tất cả thời gian"
          />
          <BentoCard
            title="Doanh thu tháng"
            value={`${formatCurrency(stats.currentMonthRevenue)}đ`}
            icon={TrendingUp}
            trend={stats.trends.revenue}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <BentoCard
            title="Hóa đơn"
            value={stats.currentMonthInvoices}
            icon={Receipt}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            subtitle={`${stats.totalInvoices} tổng`}
          />
          <BentoCard
            title="Sách tồn"
            value={stats.totalStock.toLocaleString()}
            icon={BookOpen}
            trend={stats.trends.stock}
            iconBg="bg-cyan-100"
            iconColor="text-cyan-600"
          />
          <BentoCard
            title="Công nợ"
            value={`${formatCurrency(stats.totalDebt)}đ`}
            icon={CreditCard}
            trend={stats.trends.debt}
            iconBg="bg-rose-100"
            iconColor="text-rose-600"
          />
          <BentoCard
            title="Khách hàng"
            value={stats.totalCustomers}
            icon={Users}
            trend={stats.trends.customers}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
          />
        </div>

        {/* Row 2: Charts Grid - Takes full 12 columns */}
        <div className="grid grid-cols-12 gap-3 mb-4">
          {/* Area Chart - Takes 8 columns */}
          <div className="lg:col-span-8 col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-800">Doanh thu năm nay</h3>
              <p className="text-xs text-slate-400">Biểu đồ doanh thu theo tháng</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0369A1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0369A1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                    formatter={(value: any) => [`${formatCurrency(value)}đ`, 'Doanh thu']}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#0369A1"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Takes 4 columns */}
          <div className="lg:col-span-4 col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-800">Tỷ lệ bán hàng</h3>
              <p className="text-xs text-slate-400">Top 5 sách bán chạy</p>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} cuốn`, 'Đã bán']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-1.5">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600 truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <span className="font-medium text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Rankings - Top Books & Top Payers */}
        <div className="grid lg:grid-cols-2 gap-3">
          {/* Top Books */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Sách bán chạy</h3>
                <p className="text-xs text-slate-400">Top 5 sản phẩm</p>
              </div>
              <Award size={18} className="text-amber-500" />
            </div>
            <div className="space-y-2">
              {stats.topBooks.slice(0, 5).map((book, idx) => (
                <RankingItem
                  key={book.id}
                  rank={idx + 1}
                  avatar={
                    <div className="w-10 h-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {book.imageUrl ? (
                        <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={16} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  }
                  title={book.title}
                  subtitle={book.author}
                  value={`${formatCurrency(book.price)}đ`}
                  valueSubtext={`Đã bán: ${book.totalSold}`}
                  valueColor="text-blue-600"
                />
              ))}
            </div>
          </div>

          {/* Top Payers */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Khách hàng VIP</h3>
                <p className="text-xs text-slate-400">Top 5 thanh toán nhiều nhất</p>
              </div>
              <Users size={18} className="text-purple-500" />
            </div>
            <div className="space-y-2">
              {stats.topPayers.slice(0, 5).map((payer, idx) => (
                <RankingItem
                  key={payer.id}
                  rank={idx + 1}
                  avatar={
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {payer.name.charAt(0).toUpperCase()}
                    </div>
                  }
                  title={payer.name}
                  subtitle={payer.phone || payer.email}
                  value={`${formatCurrency(payer.totalPaid)}đ`}
                  valueSubtext={`${payer.paymentCount} lần`}
                  valueColor="text-emerald-600"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;