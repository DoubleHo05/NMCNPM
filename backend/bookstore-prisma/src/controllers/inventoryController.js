const prisma = require('../config/database');

// Nhập hàng (Tạo phiếu nhập và cập nhật kho)
const importGoods = async (req, res) => {
    try {
        const { maNV, chiTietNhap } = req.body; // chiTietNhap: [{ maSach, soLuongNhap, giaNhap }]

        if (!maNV || !chiTietNhap || !Array.isArray(chiTietNhap) || chiTietNhap.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu nhập hàng không hợp lệ',
            });
        }

        // Tính tổng tiền nhập
        const tongTienNhap = chiTietNhap.reduce((total, item) => {
            return total + (item.soLuongNhap * item.giaNhap);
        }, 0);

        // Sử dụng transaction để đảm bảo tính toàn vẹn dữ liệu
        const result = await prisma.$transaction(async (prisma) => {
            // 1. Tạo phiếu nhập sách
            const phieuNhap = await prisma.phieuNhapSach.create({
                data: {
                    maNV,
                    tongTienNhap,
                },
            });

            // 2. Tạo chi tiết phiếu nhập và cập nhật số lượng tồn + giá nhập cho từng sách
            for (const item of chiTietNhap) {
                // Tạo chi tiết phiếu nhập
                await prisma.chiTietPhieuNhap.create({
                    data: {
                        maPhieuNhap: phieuNhap.maPhieuNhap,
                        maSach: item.maSach,
                        soLuongNhap: item.soLuongNhap,
                        giaNhap: item.giaNhap,
                        thanhTien: item.soLuongNhap * item.giaNhap,
                    },
                });

                // Cập nhật số lượng tồn và giá nhập mới nhất cho sách
                await prisma.sach.update({
                    where: { maSach: item.maSach },
                    data: {
                        soLuongTon: { increment: item.soLuongNhap },
                        giaNhap: item.giaNhap, // Cập nhật giá nhập mới nhất
                    },
                });
            }

            return phieuNhap;
        });

        res.status(201).json({
            success: true,
            message: 'Nhập hàng thành công',
            data: { phieuNhap: result },
        });
    } catch (error) {
        console.error('Import goods error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi nhập hàng',
        });
    }
};

// Cập nhật tồn kho (Cập nhật trực tiếp số lượng)
const updateStock = async (req, res) => {
    try {
        const { maSach, soLuongTon } = req.body;

        if (!maSach || soLuongTon === undefined || soLuongTon < 0) {
            return res.status(400).json({
                success: false,
                message: 'Thông tin cập nhật kho không hợp lệ',
            });
        }

        const updatedBook = await prisma.sach.update({
            where: { maSach: parseInt(maSach) },
            data: { soLuongTon: parseInt(soLuongTon) },
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật tồn kho thành công',
            data: { sach: updatedBook },
        });
    } catch (error) {
        console.error('Update stock error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sách',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật tồn kho',
        });
    }
};

module.exports = {
    importGoods,
    updateStock,
};
