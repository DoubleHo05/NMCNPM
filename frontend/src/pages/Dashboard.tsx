import React from 'react';
import { useStore } from '../context/StoreContext';
import { DollarSign, BookOpen, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp size={14} />
          <span>{Math.abs(trend)}% so với tháng trước</span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { books, customers } = useStore();

  const totalStock = books.reduce((sum, book) => sum + book.stock, 0);
  const totalDebt = customers.reduce((sum, cust) => sum + cust.currentDebt, 0);
  const lowStockBooks = books.filter(b => b.stock < 50).length;

  const data = [
    { name: 'Tháng 1', sales: 4000 },
    { name: 'Tháng 2', sales: 3000 },
    { name: 'Tháng 3', sales: 2000 },
    { name: 'Tháng 4', sales: 2780 },
    { name: 'Tháng 5', sales: 1890 },
    { name: 'Tháng 6', sales: 2390 },
    { name: 'Tháng 7', sales: 3490 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng sách tồn" 
          value={totalStock.toLocaleString()} 
          icon={BookOpen} 
          trend={12} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Tổng công nợ" 
          value={`${totalDebt.toLocaleString()}đ`} 
          icon={DollarSign} 
          trend={-5} 
          color="bg-indigo-500"
        />
        <StatCard 
          title="Khách hàng" 
          value={customers.length} 
          icon={Users} 
          trend={8} 
          color="bg-purple-500"
        />
        <StatCard 
          title="Sắp hết hàng" 
          value={lowStockBooks} 
          icon={AlertTriangle} 
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Doanh thu 7 tháng đầu năm</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

         {/* Quick Actions / Recent */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Sách bán chạy</h3>
          <div className="space-y-4">
             {books.slice(0, 4).map((book, idx) => (
               <div key={book.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-12 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                    <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{book.title}</p>
                    <p className="text-sm text-slate-500">{book.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{book.price.toLocaleString()}đ</p>
                    <p className="text-xs text-slate-400">Còn: {book.stock}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;