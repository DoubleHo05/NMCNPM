const prisma = require('../config/database');

// Nhập hàng (Tạo phiếu nhập và cập nhật kho)
const importGoods = async (req, res) => {
    console.log("DEBUG IMPORT: Received payload", JSON.stringify(req.body));
    try {
        const { maNV, chiTietNhap } = req.body; // chiTietNhap: [{ maSach, soLuongNhap, giaNhap, ...bookDetails }]

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

            // 2. Tạo chi tiết phiếu nhập và cập nhật sách
            for (const item of chiTietNhap) {
                let currentMaSach = item.maSach;

                // Kiểm tra xem sách có tồn tại không
                const existingBook = await prisma.sach.findUnique({
                    where: { maSach: currentMaSach },
                });
                // Nếu sách chưa tồn tại (ID gửi lên là ID ảo/rác), ta reset currentMaSach để logic bên dưới chạy đúng
                if (!existingBook) {
                    currentMaSach = null;
                }

                // [NEW] Logic: Check if book exists by Title AND Author names (to avoid duplication)
                if (!currentMaSach && item.tenSach) {
                    // Find potential duplicates
                    const similarBooks = await prisma.sach.findMany({
                        where: {
                            tenSach: { equals: item.tenSach }, // Case sensitive depending on collation, simple check
                        },
                        include: {
                            tacGia: {
                                include: {
                                    tacGia: true
                                }
                            }
                        }
                    });

                    // Check if any similar book has the same author
                    const duplicateBook = similarBooks.find(b =>
                        b.tacGia.some(t => t.tacGia.tenTacGia.toLowerCase() === item.tacGia?.toLowerCase())
                    );

                    if (duplicateBook) {
                        console.log(`Found duplicate book: ${duplicateBook.tenSach} (ID: ${duplicateBook.maSach}). Reusing ID.`);
                        currentMaSach = duplicateBook.maSach;
                        // Update potential missing info if needed, but for now just reuse ID to update stock
                    } else {
                        // proceed to create new book if no duplicate found
                    }
                }

                // Nếu sách chưa tồn tại hoặc maSach = 0, tạo sách mới
                if (!existingBook && !currentMaSach && item.tenSach) {
                    // Xử lý Thể loại: Tìm hoặc tạo mới
                    let categoryId;
                    if (item.theLoai) {
                        const existingCategory = await prisma.theLoai.findUnique({ where: { tenTheLoai: item.theLoai } });
                        if (existingCategory) {
                            categoryId = existingCategory.maTheLoai;
                        } else {
                            const newCategory = await prisma.theLoai.create({ data: { tenTheLoai: item.theLoai } });
                            categoryId = newCategory.maTheLoai;
                        }
                    }

                    // Xử lý Nhà xuất bản: Tìm hoặc tạo mới
                    let publisherId;
                    if (item.nhaXuatBan) {
                        const existingPublisher = await prisma.nhaXuatBan.findUnique({ where: { tenNXB: item.nhaXuatBan } });
                        if (existingPublisher) {
                            publisherId = existingPublisher.maNXB;
                        } else {
                            const newPublisher = await prisma.nhaXuatBan.create({ data: { tenNXB: item.nhaXuatBan } });
                            publisherId = newPublisher.maNXB;
                        }
                    }

                    // Tạo Sách Mới
                    const newBook = await prisma.sach.create({
                        data: {
                            tenSach: item.tenSach,
                            hinhAnh: item.hinhAnh || '',
                            theLoai: categoryId ? { connect: { maTheLoai: categoryId } } : undefined,
                            nhaXuatBan: publisherId ? { connect: { maNXB: publisherId } } : undefined,

                            giaNhap: item.giaNhap,
                            giaBanLe: item.giaNhap * 1.2, // Tự động tính giá bán (ví dụ +20%) hoặc lấy từ FE nếu có
                            soLuongTon: 0, // Sẽ được cộng thêm sau bước này
                            moTa: item.moTa || `Sách nhập mới ngày ${new Date().toLocaleDateString()}`,
                            // Các trường khác nếu schema yêu cầu
                        }
                    });

                    currentMaSach = newBook.maSach;

                    // Xử lý Tác giả: Tìm hoặc tạo mới và liên kết
                    if (item.tacGia) {
                        // Giả sử item.tacGia là chuỗi tên tác giả (có thể tách bằng dấu phẩy nếu nhiều)
                        const tacGiaName = item.tacGia;
                        let authorId;

                        // Tìm tác giả theo tên (Schema TacGia không có constraint unique tên, nên ở đây dùng findFirst hoặc sửa schema)
                        // Tạm dùng findFirst
                        const existingAuthor = await prisma.tacGia.findFirst({ where: { tenTacGia: tacGiaName } });
                        if (existingAuthor) {
                            authorId = existingAuthor.maTacGia;
                        } else {
                            const newAuthor = await prisma.tacGia.create({ data: { tenTacGia: tacGiaName } });
                            authorId = newAuthor.maTacGia;
                        }

                        // Liên kết Sách - Tác giả
                        await prisma.sachTacGia.create({
                            data: {
                                maSach: currentMaSach,
                                maTacGia: authorId
                            }
                        });
                    }
                }

                // Nếu vẫn không có maSach hợp lệ (trường hợp gửi maSach check không ra và không có thông tin tạo mới)
                if (!currentMaSach) {
                    throw new Error(`Sách không tồn tại và thiếu thông tin để tạo mới (Tên: ${item.tenSach})`);
                }

                // Tạo chi tiết phiếu nhập
                await prisma.chiTietPhieuNhap.create({
                    data: {
                        maPhieuNhap: phieuNhap.maPhieuNhap,
                        maSach: currentMaSach,
                        soLuongNhap: item.soLuongNhap,
                        giaNhap: item.giaNhap,
                        thanhTien: item.soLuongNhap * item.giaNhap,
                    },
                });

                // Cập nhật số lượng tồn và giá nhập mới nhất cho sách
                await prisma.sach.update({
                    where: { maSach: currentMaSach },
                    data: {
                        soLuongTon: { increment: item.soLuongNhap },
                        giaNhap: item.giaNhap, // Cập nhật giá nhập mới nhất
                        moTa: item.moTa || undefined, // Cập nhật mô tả nếu có
                        hinhAnh: item.hinhAnh || undefined, // Cập nhật hình ảnh nếu có
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
            message: 'Lỗi server khi nhập hàng: ' + error.message,
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

const getImportHistory = async (req, res) => {
    try {
        const history = await prisma.phieuNhapSach.findMany({
            orderBy: {
                ngayNhap: 'desc',
            },
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
                                isbn: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json({
            success: true,
            data: history,
        });
    } catch (error) {
        console.error('Get import history error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy lịch sử nhập hàng',
        });
    }
};

module.exports = {
    importGoods,
    updateStock,
    getImportHistory,
};
