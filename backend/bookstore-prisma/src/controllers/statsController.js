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

    // Tổng công nợ
    const totalDebt = await prisma.khachHang.aggregate({
      _sum: {
        tienNo: true
      }
    });

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

    const currentRev = Number(currentMonthRevenue[0]?.total) || 0;
    const lastRev = Number(lastMonthRevenue[0]?.total) || 1; // Avoid division by 0
    const revenueTrend = lastRev > 0 ? Math.round(((currentRev - lastRev) / lastRev) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalStock: totalStock._sum.soLuongTon || 0,
        totalDebt: totalDebt._sum.tienNo || 0,
        totalCustomers,
        lowStockBooks,
        salesData,
        topBooks: topBooksWithAuthor,
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

    // Lấy tất cả sách với thông tin tồn kho
    const books = await prisma.sach.findMany({
      include: {
        tacGia: {
          include: {
            tacGia: true
          }
        }
      }
    });

    // Tính phát sinh trong tháng cho mỗi sách
    const reportData = await Promise.all(
      books.map(async (book) => {
        // Số lượng nhập trong tháng
        const imports = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ct.SoLuongNhap), 0) as total
          FROM chitietphieunhap ct
          JOIN phieunhapsach p ON ct.MaPhieuNhap = p.MaPhieuNhap
          WHERE ct.MaSach = ${book.maSach}
            AND MONTH(p.NgayNhap) = ${reportMonth}
            AND YEAR(p.NgayNhap) = ${reportYear}
        `;

        // Số lượng bán trong tháng
        const sales = await prisma.$queryRaw`
          SELECT COALESCE(SUM(ct.SoLuongBan), 0) as total
          FROM chitiethoadon ct
          JOIN hoadonbansach h ON ct.MaHoaDon = h.MaHoaDon
          WHERE ct.MaSach = ${book.maSach}
            AND MONTH(h.NgayBan) = ${reportMonth}
            AND YEAR(h.NgayBan) = ${reportYear}
        `;

        const importQty = Number(imports[0]?.total) || 0;
        const saleQty = Number(sales[0]?.total) || 0;
        const change = importQty - saleQty; // Phát sinh = nhập - bán
        const endStock = book.soLuongTon; // Tồn cuối = tồn hiện tại
        const startStock = endStock - change; // Tồn đầu = tồn cuối - phát sinh

        return {
          id: String(book.maSach),
          title: book.tenSach,
          author: book.tacGia?.[0]?.tacGia?.tenTacGia || 'Chưa rõ',
          startStock: Math.max(0, startStock),
          change,
          endStock
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

    // Lấy tất cả khách hàng
    const customers = await prisma.khachHang.findMany();

    // Tính phát sinh trong tháng cho mỗi khách hàng
    const reportData = await Promise.all(
      customers.map(async (customer) => {
        // Tổng tiền mua trong tháng (tăng nợ)
        const purchases = await prisma.$queryRaw`
          SELECT COALESCE(SUM(TongTien), 0) as total
          FROM hoadonbansach
          WHERE MaKH = ${customer.maKH}
            AND MONTH(NgayBan) = ${reportMonth}
            AND YEAR(NgayBan) = ${reportYear}
        `;

        // Tổng tiền thanh toán trong tháng (giảm nợ)
        const payments = await prisma.$queryRaw`
          SELECT COALESCE(SUM(SoTienThu), 0) as total
          FROM phieuthutien
          WHERE MaKH = ${customer.maKH}
            AND MONTH(NgayThu) = ${reportMonth}
            AND YEAR(NgayThu) = ${reportYear}
        `;

        const purchaseAmount = Number(purchases[0]?.total) || 0;
        const paymentAmount = Number(payments[0]?.total) || 0;
        const change = purchaseAmount - paymentAmount; // Phát sinh = mua - trả
        const endDebt = customer.tienNo || 0; // Nợ cuối = nợ hiện tại
        const startDebt = endDebt - change; // Nợ đầu = nợ cuối - phát sinh

        return {
          id: String(customer.maKH),
          name: customer.tenKH,
          phone: customer.soDienThoai || '',
          startDebt: Math.max(0, startDebt),
          change,
          endDebt
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

module.exports = {
  getDashboardStats,
  getInventoryReport,
  getDebtReport,
  getRevenueReport
};
