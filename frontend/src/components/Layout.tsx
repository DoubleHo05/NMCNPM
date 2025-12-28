import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Book, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  Menu,
  ChevronDown,
  ChevronUp,
  Wallet,
  User,
  Shield,
  LogOut,
  X,
  FilePlus,
  Cog,
  DollarSign
} from 'lucide-react';
import { timeAgo } from '../utils/time';

const SidebarItem = ({ to, icon: Icon, label, exact }: { to: string, icon: any, label: string, exact?: boolean }) => {
  const location = useLocation();
  const isActive = exact 
    ? location.pathname === to 
    : location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
        isActive
          ? 'bg-blue-50 text-blue-700 font-semibold'
          : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      <span>{label}</span>
    </Link>
  );
};

interface LayoutProps {
  children?: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { books, notifications, markNotificationsAsRead } = useStore();
  const { user } = useAuth();
  
  // Check if user is manager
  const isManager = user?.vaiTro === 'QUAN_LY';
  
  // -- Dropdown Menu State --
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // -- Search Autocomplete State --
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // -- Notification State & Logic --
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifTimeoutRef = useRef<number | null>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotifHoverEnter = () => {
    if (notifTimeoutRef.current) {
        clearTimeout(notifTimeoutRef.current);
        notifTimeoutRef.current = null;
    }
    setShowNotifPanel(true);
    if(unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

  const handleNotifHoverLeave = () => {
    notifTimeoutRef.current = window.setTimeout(() => {
        setShowNotifPanel(false);
    }, 300); // Delay to allow mouse to travel to the panel
  };

  // Filter books for suggestions
  const searchSuggestions = books.filter(b => 
     searchTerm && (
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.author.toLowerCase().includes(searchTerm.toLowerCase())
     )
  ).slice(0, 5); // Limit to top 5

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        setShowSuggestions(false);
        navigate(`/books?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (bookId: string) => {
     setShowSuggestions(false);
     setSearchTerm(''); // Optional: clear search or keep it
     navigate(`/books/detail/${bookId}`);
  };

  // Determine title based on path
  let pageTitle = 'Dashboard';
  if (location.pathname.includes('books')) pageTitle = 'Sách';
  if (location.pathname.includes('detail')) pageTitle = 'Chi tiết sách';
  if (location.pathname.includes('sales')) pageTitle = 'Bán hàng';
  if (location.pathname.includes('import')) pageTitle = 'Nhập kho';
  if (location.pathname.includes('reports')) pageTitle = 'Báo cáo';
  if (location.pathname.includes('settings')) pageTitle = 'Cài đặt';
  if (location.pathname.includes('account')) pageTitle = 'Tài khoản & Cài đặt';

  const notificationIcons = {
    import: <FilePlus className="text-blue-500" size={20} />,
    invoice: <FileText className="text-green-500" size={20} />,
    payment: <DollarSign className="text-purple-500" size={20} />,
    settings: <Cog className="text-amber-500" size={20} />,
    info: <Bell className="text-slate-500" size={20} />,
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            BS
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-tight">BookStore</h1>
            <p className="text-xs text-slate-500">Manager</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Tổng quan
          </div>
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" exact />
          
          <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Quản lý
          </div>
          <SidebarItem to="/books" icon={Book} label="Tra cứu sách" />
          <SidebarItem to="/books/import" icon={Wallet} label="Nhập sách (BM1)" />
          
          <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Kinh doanh
          </div>
          <SidebarItem to="/sales/invoice" icon={ShoppingCart} label="Bán sách (BM2)" />
          <SidebarItem to="/sales/collect" icon={FileText} label="Thu tiền (BM4)" />

          <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Hệ thống
          </div>
          {isManager && (
            <SidebarItem to="/users" icon={User} label="Quản lý nhân viên" />
          )}
          <SidebarItem to="/reports" icon={FileText} label="Báo cáo (BM5)" />
          <SidebarItem to="/settings" icon={Settings} label="Quy định (QĐ6)" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div 
            onClick={() => navigate('/account')}
            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors ${location.pathname.includes('account') ? 'bg-slate-50' : ''}`}
          >
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Nguyen+Admin&background=0D8ABC&color=fff" alt="Admin" className="w-full h-full object-cover"/>
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">Nguyen Admin</p>
                <p className="text-xs text-slate-500 truncate">admin@bookstore.com</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-semibold text-slate-800">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* SEARCH BAR WITH AUTOCOMPLETE */}
            <div className="relative hidden sm:block w-80" ref={searchContainerRef}>
              <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm sách..." 
                    className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleSearchSubmit}
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  {searchTerm && (
                      <button 
                        onClick={() => { setSearchTerm(''); setShowSuggestions(false); }}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                          <X size={16} />
                      </button>
                  )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                      {searchSuggestions.length > 0 ? (
                          <>
                            <div className="p-2">
                                <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase">Gợi ý tìm kiếm</p>
                                {searchSuggestions.map(book => (
                                    <div 
                                        key={book.id}
                                        onClick={() => handleSuggestionClick(book.id)}
                                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group"
                                    >
                                        <div className="w-8 h-10 bg-slate-200 rounded overflow-hidden flex-shrink-0 border border-slate-100">
                                            <img src={book.imageUrl} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 group-hover:text-blue-700 truncate">{book.title}</p>
                                            <p className="text-xs text-slate-500 truncate">{book.author}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div 
                                onClick={() => {
                                    setShowSuggestions(false);
                                    navigate(`/books?search=${encodeURIComponent(searchTerm)}`);
                                }}
                                className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-center text-blue-600 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                Xem tất cả kết quả cho "{searchTerm}"
                            </div>
                          </>
                      ) : (
                          <div className="p-4 text-center text-slate-500 text-sm">
                              Không tìm thấy sách nào phù hợp.
                          </div>
                      )}
                  </div>
              )}
            </div>
            
            <div 
              ref={notifRef}
              onMouseEnter={handleNotifHoverEnter}
              onMouseLeave={handleNotifHoverLeave}
              className="flex items-center gap-2 border-l border-slate-200 pl-4 relative"
            >
              <button 
                onClick={() => navigate('/account?tab=notification')}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border border-white text-[10px] text-white flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Hover Panel */}
              {showNotifPanel && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800">Thông báo</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.slice(0, 5).map(notif => (
                                <div key={notif.id} className="flex items-start gap-3 p-4 border-b border-slate-100 hover:bg-slate-50">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                        {notificationIcons[notif.type]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-800">{notif.title}</p>
                                        <p className="text-xs text-slate-500">{notif.message}</p>
                                        <p className="text-xs text-blue-500 mt-1">{timeAgo(notif.timestamp)}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <div className="p-8 text-center text-slate-500 text-sm">
                                Bạn chưa có thông báo nào.
                            </div>
                        )}
                    </div>
                    <div 
                        onClick={() => navigate('/account?tab=notification')}
                        className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-xs text-center text-blue-600 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                        Xem tất cả thông báo
                    </div>
                </div>
              )}
            </div>
            
            {/* User Profile Section with Split Logic */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-4 relative" ref={dropdownRef}>
                 {/* Main Clickable Area: Navigates to Account */}
                 <div 
                    onClick={() => navigate('/account')} 
                    className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Vào trang cài đặt tài khoản"
                 >
                    <div className="w-8 h-8 rounded bg-slate-200 overflow-hidden">
                        <img src="https://ui-avatars.com/api/?name=Nguyen+Admin&background=0D8ABC&color=fff" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-none">Nguyen</p>
                        <p className="text-xs text-slate-500">Admin</p>
                    </div>
                 </div>

                 {/* Arrow Toggle: Controls Dropdown */}
                 <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsDropdownOpen(!isDropdownOpen);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                 >
                    {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                 </button>

                 {/* Dropdown Menu */}
                 {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        <div className="p-2">
                             <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                <p className="text-sm font-bold text-slate-800">Nguyen Admin</p>
                                <p className="text-xs text-slate-500 truncate">admin@bookstore.com</p>
                             </div>
                             
                             <button 
                                onClick={() => { setIsDropdownOpen(false); navigate('/account?tab=profile'); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                             >
                                <User size={16} />
                                Tài khoản
                             </button>
                             <button 
                                onClick={() => { setIsDropdownOpen(false); navigate('/account?tab=security'); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                             >
                                <Shield size={16} />
                                Bảo mật
                             </button>
                             <button 
                                onClick={() => { setIsDropdownOpen(false); navigate('/account?tab=notification'); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors text-left"
                             >
                                <Bell size={16} />
                                Thông báo
                             </button>
                        </div>
                        <div className="p-2 border-t border-slate-100 bg-slate-50">
                             <button 
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                                <LogOut size={16} />
                                Đăng xuất
                             </button>
                        </div>
                    </div>
                 )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;