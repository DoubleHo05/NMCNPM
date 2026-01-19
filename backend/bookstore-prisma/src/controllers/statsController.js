const prisma = require('../utils/prisma');

// Lấy thống kê cho Dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Tổng sách tồn
    const totalStock = await prisma.sach.aggregate({
      _sum: {
        soLuongTon: true
      }
    });

    // Tổng công nợ (tính từ hóa đơn - phiếu thu)
    const debtResult = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(h.TongTien), 0) - COALESCE((SELECT SUM(SoTienThu) FROM phieuthutien), 0) as totalDebt
      FROM hoadonbansach h
    `;
    const totalDebt = Number(debtResult[0]?.totalDebt) || 0;

    // Tổng khách hàng
    const totalCustomers = await prisma.khachHang.count();

    // Sách sắp hết hàng (tồn < 50)
    const lowStockBooks = await prisma.sach.count({
      where: {
        soLuongTon: {
          lt: 50
        }
      }
    });

    // Doanh thu theo tháng trong năm hiện tại
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await prisma.$queryRaw`
      SELECT 
        MONTH(NgayBan) as month,
        SUM(TongTien) as revenue
      FROM hoadonbansach
      WHERE YEAR(NgayBan) = ${currentYear}
      GROUP BY MONTH(NgayBan)
      ORDER BY month
    `;

    // Tạo array 12 tháng với giá trị 0 cho tháng không có dữ liệu
    const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    const salesData = monthNames.map((name, idx) => {
      const monthData = monthlyRevenue.find(m => Number(m.month) === idx + 1);
      return {
        name,
        sales: monthData ? Number(monthData.revenue) : 0
      };
    });

    // Top 5 sách bán chạy
    const topBooks = await prisma.$queryRaw`
      SELECT 
        s.MaSach as id,
        s.TenSach as title,
        s.GiaBanLe as price,
        s.SoLuongTon as stock,
        s.HinhAnh as imageUrl,
        COALESCE(SUM(ct.SoLuongBan), 0) as totalSold
      FROM sach s
      LEFT JOIN chitiethoadon ct ON s.MaSach = ct.MaSach
      GROUP BY s.MaSach
      ORDER BY totalSold DESC
      LIMIT 5
    `;

    // Lấy tên tác giả cho top books
    const topBooksWithAuthor = await Promise.all(
      topBooks.map(async (book) => {
        const bookWithAuthor = await prisma.sach.findUnique({
          where: { maSach: Number(book.id) },
          include: {
            tacGia: {
              include: {
                tacGia: true
              }
            }
          }
        });
        const authorName = bookWithAuthor?.tacGia?.[0]?.tacGia?.tenTacGia || 'Chưa rõ';
        return {
          id: String(book.id),
          title: book.title,
          price: Number(book.price) || 0,
          stock: Number(book.stock) || 0,
          imageUrl: book.imageUrl || '',
          author: authorName,
          totalSold: Number(book.totalSold) || 0
        };
      })
    );

    // Top 5 khách hàng trả tiền nhiều nhất (tổng thanh toán)
    const topPayers = await prisma.$queryRaw`
      SELECT 
        kh.MaKH as id,
        kh.TenKH as name,
        kh.SoDienThoai as phone,
        kh.Email as email,
        COALESCE(SUM(pt.SoTienThu), 0) as totalPaid,
        COUNT(pt.MaPhieuThu) as paymentCount
      FROM khachhang kh
      LEFT JOIN hoadonbansach hd ON kh.MaKH = hd.MaKH
      LEFT JOIN phieuthutien pt ON hd.MaHoaDon = pt.MaHoaDon
      GROUP BY kh.MaKH
      HAVING totalPaid > 0
      ORDER BY totalPaid DESC
      LIMIT 5
    `;

    const topPayersFormatted = topPayers.map(p => ({
      id: String(p.id),
      name: p.name || 'Không tên',
      phone: p.phone || '',
      email: p.email || '',
      totalPaid: Number(p.totalPaid) || 0,
      paymentCount: Number(p.paymentCount) || 0
    }));

    // Tổng số hóa đơn
    const totalInvoices = await prisma.hoaDonBanSach.count();

    // Tổng doanh thu (tất cả)
    const totalRevenueAll = await prisma.hoaDonBanSach.aggregate({
      _sum: {
        tongTien: true
      }
    });

    // Tính xu hướng (so sánh với tháng trước)
    const currentMonth = new Date().getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthRevenue = await prisma.$queryRaw`
      SELECT COALESCE(SUM(TongTien), 0) as total FROM hoadonbansach 
      WHERE MONTH(NgayBan) = ${currentMonth} AND YEAR(NgayBan) = ${currentYear}
    `;
    const lastMonthRevenue = await prisma.$queryRaw`
      SELECT COALESCE(SUM(TongTien), 0) as total FROM hoadonbansach 
      WHERE MONTH(NgayBan) = ${lastMonth} AND YEAR(NgayBan) = ${lastMonthYear}
    `;

    // Số hóa đơn tháng này
    const currentMonthInvoices = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM hoadonbansach 
      WHERE MONTH(NgayBan) = ${currentMonth} AND YEAR(NgayBan) = ${currentYear}
    `;

    const currentRev = Number(currentMonthRevenue[0]?.total) || 0;
    const lastRev = Number(lastMonthRevenue[0]?.total) || 1; // Avoid division by 0
    const revenueTrend = lastRev > 0 ? Math.round(((currentRev - lastRev) / lastRev) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalStock: totalStock._sum.soLuongTon || 0,
        totalDebt,
        totalCustomers,
        lowStockBooks,
        totalInvoices,
        totalRevenue: Number(totalRevenueAll._sum.tongTien) || 0,
        currentMonthRevenue: currentRev,
        currentMonthInvoices: Number(currentMonthInvoices[0]?.total) || 0,
        salesData,
        topBooks: topBooksWithAuthor,
        topPayers: topPayersFormatted,
        trends: {
          stock: 12, // Có thể tính từ dữ liệu thực tế sau
          debt: -5,
          customers: 8,
          revenue: revenueTrend
        }
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard',
      error: error.message
    });
  }
};

// Báo cáo tồn kho theo tháng (BM5.1)
const getInventoryReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const reportMonth = parseInt(month) || new Date().getMonth() + 1;
    const reportYear = parseInt(year) || new Date().getFullYear();

    // Ngày đầu và cuối tháng báo cáo
    const startOfMonth = new Date(reportYear, reportMonth - 1, 1);
    const endOfMonth = new Date(reportYear, reportMonth, 0, 23, 59, 59);

    // Lấy tất cả sách
    const books = await prisma.sach.findMany({
      include: {
        tacGia: {
          include: {
            tacGia: true
          }
        }
      }
    });

    // Tính tồn kho cho mỗi sách
    const reportData = await Promise.all(
      books.map(async (book) => {
        // Tổng nhập từ đầu đến TRƯỚC tháng báo cáo (tính tồn đầu kỳ)
        const importsBefore = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ct.SoLuongNhap), 0) as total
          FROM chitietphieunhap ct
          JOIN phieunhapsach p ON ct.MaPhieuNhap = p.MaPhieuNhap
          WHERE ct.MaSach = ${book.maSach}
            AND p.NgayNhap < ${startOfMonth}
        `;

        // Tổng bán từ đầu đến TRƯỚC tháng báo cáo
        const salesBefore = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ct.SoLuongBan), 0) as total
          FROM chitiethoadon ct
          JOIN hoadonbansach h ON ct.MaHoaDon = h.MaHoaDon
          WHERE ct.MaSach = ${book.maSach}
            AND h.NgayBan < ${startOfMonth}
        `;

        // Nhập TRONG tháng báo cáo
        const importsInMonth = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ct.SoLuongNhap), 0) as total
          FROM chitietphieunhap ct
          JOIN phieunhapsach p ON ct.MaPhieuNhap = p.MaPhieuNhap
          WHERE ct.MaSach = ${book.maSach}
            AND p.NgayNhap >= ${startOfMonth}
            AND p.NgayNhap <= ${endOfMonth}
        `;

        // Bán TRONG tháng báo cáo
        const salesInMonth = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ct.SoLuongBan), 0) as total
          FROM chitiethoadon ct
          JOIN hoadonbansach h ON ct.MaHoaDon = h.MaHoaDon
          WHERE ct.MaSach = ${book.maSach}
            AND h.NgayBan >= ${startOfMonth}
            AND h.NgayBan <= ${endOfMonth}
        `;

        const totalImportBefore = Number(importsBefore[0]?.total) || 0;
        const totalSaleBefore = Number(salesBefore[0]?.total) || 0;
        const importQty = Number(importsInMonth[0]?.total) || 0;
        const saleQty = Number(salesInMonth[0]?.total) || 0;

        // Tồn đầu kỳ = tổng nhập trước - tổng bán trước
        const startStock = totalImportBefore - totalSaleBefore;
        // Phát sinh = nhập trong kỳ - bán trong kỳ
        const change = importQty - saleQty;
        // Tồn cuối kỳ = tồn đầu + phát sinh
        const endStock = startStock + change;

        return {
          id: String(book.maSach),
          title: book.tenSach,
          author: book.tacGia?.[0]?.tacGia?.tenTacGia || 'Chưa rõ',
          startStock: Math.max(0, startStock),
          importQty,
          saleQty,
          change,
          endStock: Math.max(0, endStock)
        };
      })
    );

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error getting inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo tồn kho',
      error: error.message
    });
  }
};

// Báo cáo công nợ theo tháng (BM5.2)
const getDebtReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const reportMonth = parseInt(month) || new Date().getMonth() + 1;
    const reportYear = parseInt(year) || new Date().getFullYear();

    // Ngày đầu và cuối tháng báo cáo
    const startOfMonth = new Date(reportYear, reportMonth - 1, 1);
    const endOfMonth = new Date(reportYear, reportMonth, 0, 23, 59, 59);

    // Lấy tất cả khách hàng
    const customers = await prisma.khachHang.findMany();

    // Tính công nợ cho mỗi khách hàng
    const reportData = await Promise.all(
      customers.map(async (customer) => {
        // Tổng mua TRƯỚC tháng báo cáo
        const purchasesBefore = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ThanhTien), 0) as total
          FROM hoadonbansach
          WHERE MaKH = ${customer.maKH}
            AND NgayBan < ${startOfMonth}
        `;

        // Tổng thanh toán TRƯỚC tháng báo cáo (join qua hóa đơn)
        const paymentsBefore = await prisma.$queryRaw`
          SELECT COALESCE(SUM(p.SoTienThu), 0) as total
          FROM phieuthutien p
          JOIN hoadonbansach h ON p.MaHoaDon = h.MaHoaDon
          WHERE h.MaKH = ${customer.maKH}
            AND p.NgayThu < ${startOfMonth}
        `;

        // Mua TRONG tháng báo cáo
        const purchasesInMonth = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ThanhTien), 0) as total
          FROM hoadonbansach
          WHERE MaKH = ${customer.maKH}
            AND NgayBan >= ${startOfMonth}
            AND NgayBan <= ${endOfMonth}
        `;

        // Thanh toán TRONG tháng báo cáo
        const paymentsInMonth = await prisma.$queryRaw`
          SELECT COALESCE(SUM(p.SoTienThu), 0) as total
          FROM phieuthutien p
          JOIN hoadonbansach h ON p.MaHoaDon = h.MaHoaDon
          WHERE h.MaKH = ${customer.maKH}
            AND p.NgayThu >= ${startOfMonth}
            AND p.NgayThu <= ${endOfMonth}
        `;

        const totalPurchaseBefore = Number(purchasesBefore[0]?.total) || 0;
        const totalPaymentBefore = Number(paymentsBefore[0]?.total) || 0;
        const purchaseAmount = Number(purchasesInMonth[0]?.total) || 0;
        const paymentAmount = Number(paymentsInMonth[0]?.total) || 0;

        // Nợ đầu kỳ = tổng mua trước - tổng trả trước
        const startDebt = totalPurchaseBefore - totalPaymentBefore;
        // Phát sinh = mua trong kỳ - trả trong kỳ
        const change = purchaseAmount - paymentAmount;
        // Nợ cuối kỳ = nợ đầu + phát sinh
        const endDebt = startDebt + change;

        return {
          id: String(customer.maKH),
          name: customer.tenKH,
          phone: customer.soDienThoai || '',
          startDebt: Math.max(0, startDebt),
          purchaseAmount,
          paymentAmount,
          change,
          endDebt: Math.max(0, endDebt)
        };
      })
    );

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error getting debt report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo công nợ',
      error: error.message
    });
  }
};

// Báo cáo doanh thu (mới)
const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    // Default to current year if no dates provided
    const currentYear = new Date().getFullYear();
    const start = startDate || `${currentYear}-01-01`;
    const end = endDate || `${currentYear}-12-31`;

    // Revenue by period
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE(NgayBan) as date,
        COUNT(*) as totalInvoices,
        SUM(TongTien) as revenue,
        SUM(TongTien - COALESCE(TienGiamGia, 0)) as netRevenue
      FROM hoadonbansach
      WHERE NgayBan BETWEEN ${start} AND ${end}
      GROUP BY DATE(NgayBan)
      ORDER BY date
    `;

    // Monthly summary
    const monthlySummary = await prisma.$queryRaw`
      SELECT 
        MONTH(NgayBan) as month,
        YEAR(NgayBan) as year,
        COUNT(*) as totalInvoices,
        SUM(TongTien) as revenue
      FROM hoadonbansach
      WHERE NgayBan BETWEEN ${start} AND ${end}
      GROUP BY YEAR(NgayBan), MONTH(NgayBan)
      ORDER BY year, month
    `;

    // Top selling books in period
    const topProducts = await prisma.$queryRaw`
      SELECT 
        s.MaSach as id,
        s.TenSach as title,
        SUM(ct.SoLuongBan) as quantitySold,
        SUM(ct.SoLuongBan * ct.GiaBan) as revenue
      FROM chitiethoadon ct
      JOIN sach s ON ct.MaSach = s.MaSach
      JOIN hoadonbansach h ON ct.MaHoaDon = h.MaHoaDon
      WHERE h.NgayBan BETWEEN ${start} AND ${end}
      GROUP BY s.MaSach
      ORDER BY revenue DESC
      LIMIT 10
    `;

    // Total summary
    const totalSummary = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalInvoices,
        COALESCE(SUM(TongTien), 0) as totalRevenue,
        COALESCE(AVG(TongTien), 0) as avgOrderValue
      FROM hoadonbansach
      WHERE NgayBan BETWEEN ${start} AND ${end}
    `;

    res.json({
      success: true,
      data: {
        summary: {
          totalInvoices: Number(totalSummary[0]?.totalInvoices) || 0,
          totalRevenue: Number(totalSummary[0]?.totalRevenue) || 0,
          avgOrderValue: Number(totalSummary[0]?.avgOrderValue) || 0,
          startDate: start,
          endDate: end
        },
        dailyRevenue: revenueData.map(d => ({
          date: d.date,
          invoices: Number(d.totalInvoices),
          revenue: Number(d.revenue),
          netRevenue: Number(d.netRevenue)
        })),
        monthlyRevenue: monthlySummary.map(m => ({
          month: Number(m.month),
          year: Number(m.year),
          invoices: Number(m.totalInvoices),
          revenue: Number(m.revenue)
        })),
        topProducts: topProducts.map(p => ({
          id: String(p.id),
          title: p.title,
          quantitySold: Number(p.quantitySold),
          revenue: Number(p.revenue)
        }))
      }
    });
  } catch (error) {
    console.error('Error getting revenue report:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy báo cáo doanh thu',
      error: error.message
    });
  }
};

// Get AI Insights (NEW)
const getAIInsights = async (req, res) => {
  try {
    const geminiService = require('../services/geminiService');

    // Get current stats for AI analysis
    const stats = await getDashboardStatsData();

    // Get historical revenue for prediction (last 6 months)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const historicalRevenue = await prisma.$queryRaw`
      SELECT 
        MONTH(NgayBan) as month,
        YEAR(NgayBan) as year,
        SUM(TongTien) as revenue
      FROM hoadonbansach
      WHERE NgayBan >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY YEAR(NgayBan), MONTH(NgayBan)
      ORDER BY year, month
    `;

    const historicalData = historicalRevenue.map(h => ({
      month: Number(h.month),
      year: Number(h.year),
      revenue: Number(h.revenue) || 0
    }));

    // Generate AI insights
    const [insights, revenuePrediction, trendingBooks] = await Promise.all([
      geminiService.generateInsights(stats),
      geminiService.predictRevenue(historicalData),
      geminiService.getTrendingBooks(prisma)
    ]);

    res.json({
      success: true,
      data: {
        insights,
        revenuePrediction,
        trendingBooks,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error getting AI insights:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy AI insights',
      error: error.message
    });
  }
};

// Helper function to get dashboard stats data (extracted for reuse)
async function getDashboardStatsData() {
  const totalStock = await prisma.sach.aggregate({
    _sum: { soLuongTon: true }
  });

  const totalCustomers = await prisma.khachHang.count();

  const totalRevenueAll = await prisma.hoaDonBanSach.aggregate({
    _sum: { tongTien: true }
  });

  const topBooks = await prisma.$queryRaw`
    SELECT 
      s.TenSach as title,
      COALESCE(SUM(ct.SoLuongBan), 0) as totalSold
    FROM sach s
    LEFT JOIN chitiethoadon ct ON s.MaSach = ct.MaSach
    GROUP BY s.MaSach
    ORDER BY totalSold DESC
    LIMIT 5
  `;

  return {
    totalBooks: totalStock._sum.soLuongTon || 0,
    totalCustomers,
    totalRevenue: Number(totalRevenueAll._sum.tongTien) || 0,
    topBooks: topBooks.map(b => ({ title: b.title, sold: Number(b.totalSold) }))
  };
}

module.exports = {
  getDashboardStats,
  getInventoryReport,
  getDebtReport,
  getRevenueReport,
  getAIInsights
};
