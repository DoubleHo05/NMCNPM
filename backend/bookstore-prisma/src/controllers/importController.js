const prisma = require('../utils/prisma');

// Lấy tất cả phiếu nhập sách
const getAllImports = async (req, res) => {
  try {
    const imports = await prisma.phieuNhapSach.findMany({
      include: {
        nhanVien: {
          select: {
            hoTen: true,
          },
        },
        chiTiet: {
          include: {
            sach: {
              select: {
                tenSach: true,
              },
            },
          },
        },
      },
      orderBy: {
        ngayNhap: 'desc',
      },
    });

    const transformedImports = imports.map((imp) => ({
      id: imp.maPhieuNhap.toString(),
      date: imp.ngayNhap?.toISOString() || new Date().toISOString(),
      employeeName: imp.nhanVien?.hoTen || 'Không rõ',
      totalAmount: parseFloat(imp.tongTienNhap) || 0,
      items: imp.chiTiet.map((ct) => ({
        bookId: ct.maSach?.toString() || '',
        bookName: ct.sach?.tenSach || 'Không rõ',
        quantity: ct.soLuongNhap,
        price: parseFloat(ct.giaNhap) || 0,
        total: parseFloat(ct.thanhTien) || 0,
      })),
    }));

    res.json({
      success: true,
      data: transformedImports,
      message: 'Lấy danh sách phiếu nhập thành công',
    });
  } catch (error) {
    console.error('Error getting imports:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phiếu nhập',
      error: error.message,
    });
  }
};

// Lấy chi tiết phiếu nhập
const getImportById = async (req, res) => {
  try {
    const { id } = req.params;

    const imp = await prisma.phieuNhapSach.findUnique({
      where: { maPhieuNhap: parseInt(id) },
      include: {
        nhanVien: {
          select: {
            hoTen: true,
          },
        },
        chiTiet: {
          include: {
            sach: {
              select: {
                tenSach: true,
              },
            },
          },
        },
      },
    });

    if (!imp) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu nhập',
      });
    }

    const transformedImport = {
      id: imp.maPhieuNhap.toString(),
      date: imp.ngayNhap?.toISOString() || new Date().toISOString(),
      employeeName: imp.nhanVien?.hoTen || 'Không rõ',
      totalAmount: parseFloat(imp.tongTienNhap) || 0,
      items: imp.chiTiet.map((ct) => ({
        bookId: ct.maSach?.toString() || '',
        bookName: ct.sach?.tenSach || 'Không rõ',
        quantity: ct.soLuongNhap,
        price: parseFloat(ct.giaNhap) || 0,
        total: parseFloat(ct.thanhTien) || 0,
      })),
    };

    res.json({
      success: true,
      data: transformedImport,
    });
  } catch (error) {
    console.error('Error getting import:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phiếu nhập',
      error: error.message,
    });
  }
};

// Tạo phiếu nhập mới
const createImport = async (req, res) => {
  try {
    const { items } = req.body;
    const maNV = req.user?.maNV || 1; // Lấy từ token hoặc mặc định

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn sách cần nhập',
      });
    }

    // Tính tổng tiền nhập
    let tongTienNhap = 0;
    for (const item of items) {
      tongTienNhap += item.quantity * item.price;
    }

    // Tạo phiếu nhập với transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo phiếu nhập
      const newImport = await tx.phieuNhapSach.create({
        data: {
          maNV,
          tongTienNhap,
          chiTiet: {
            create: items.map((item) => ({
              maSach: parseInt(item.bookId),
              soLuongNhap: item.quantity,
              giaNhap: item.price,
              thanhTien: item.quantity * item.price,
            })),
          },
        },
        include: {
          chiTiet: {
            include: {
              sach: true,
            },
          },
        },
      });

      // 2. Cập nhật số lượng tồn cho từng sách
      for (const item of items) {
        await tx.sach.update({
          where: { maSach: parseInt(item.bookId) },
          data: {
            soLuongTon: {
              increment: item.quantity,
            },
          },
        });
      }

      return newImport;
    });

    res.status(201).json({
      success: true,
      data: {
        id: result.maPhieuNhap.toString(),
        date: result.ngayNhap?.toISOString(),
        totalAmount: parseFloat(result.tongTienNhap) || 0,
        items: result.chiTiet.map((ct) => ({
          bookId: ct.maSach?.toString(),
          bookName: ct.sach?.tenSach,
          quantity: ct.soLuongNhap,
          price: parseFloat(ct.giaNhap),
        })),
      },
      message: 'Tạo phiếu nhập thành công',
    });
  } catch (error) {
    console.error('Error creating import:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phiếu nhập',
      error: error.message,
    });
  }
};

module.exports = {
  getAllImports,
  getImportById,
  createImport,
};
