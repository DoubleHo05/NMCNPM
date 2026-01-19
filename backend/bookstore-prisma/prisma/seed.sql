-- =============================================
-- COMPLETE DATABASE SEED FILE FOR BOOKSTORE
-- Includes: Schema + All Data
-- =============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- =============================================
-- PHẦN 1: TẠO SCHEMA (từ Prisma migrations)
-- =============================================

-- CreateTable nhanvien
CREATE TABLE IF NOT EXISTS `nhanvien` (
    `MaNV` INTEGER NOT NULL AUTO_INCREMENT,
    `TenDangNhap` VARCHAR(50) NOT NULL,
    `MatKhau` VARCHAR(255) NOT NULL,
    `HoTen` VARCHAR(100) NOT NULL,
    `Email` VARCHAR(100) NULL,
    `SoDienThoai` VARCHAR(20) NULL,
    `VaiTro` ENUM('THU_KHO', 'THU_NGAN', 'QUAN_LY') NOT NULL,
    `TrangThai` BOOLEAN NULL DEFAULT true,
    `CreatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `UpdatedAt` DATETIME(3) NULL,
    UNIQUE INDEX `nhanvien_TenDangNhap_key`(`TenDangNhap`),
    UNIQUE INDEX `nhanvien_Email_key`(`Email`),
    PRIMARY KEY (`MaNV`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable khachhang
CREATE TABLE IF NOT EXISTS `khachhang` (
    `MaKH` INTEGER NOT NULL AUTO_INCREMENT,
    `TenKH` VARCHAR(100) NULL,
    `SoDienThoai` VARCHAR(20) NULL,
    `Email` VARCHAR(100) NULL,
    `DiaChi` VARCHAR(255) NULL,
    `DiemTichLuy` INTEGER NULL DEFAULT 0,
    `TienNo` DECIMAL(15, 2) NULL DEFAULT 0,
    PRIMARY KEY (`MaKH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable theloai
CREATE TABLE IF NOT EXISTS `theloai` (
    `MaTheLoai` INTEGER NOT NULL AUTO_INCREMENT,
    `TenTheLoai` VARCHAR(100) NOT NULL,
    UNIQUE INDEX `theloai_TenTheLoai_key`(`TenTheLoai`),
    PRIMARY KEY (`MaTheLoai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable nhaxuatban
CREATE TABLE IF NOT EXISTS `nhaxuatban` (
    `MaNXB` INTEGER NOT NULL AUTO_INCREMENT,
    `TenNXB` VARCHAR(255) NOT NULL,
    `DiaChi` VARCHAR(500) NULL,
    `SoDienThoai` VARCHAR(20) NULL,
    UNIQUE INDEX `nhaxuatban_TenNXB_key`(`TenNXB`),
    PRIMARY KEY (`MaNXB`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable sach
CREATE TABLE IF NOT EXISTS `sach` (
    `MaSach` INTEGER NOT NULL AUTO_INCREMENT,
    `ISBN` VARCHAR(20) NULL,
    `TenSach` VARCHAR(500) NOT NULL,
    `MaTheLoai` INTEGER NULL,
    `MaNXB` INTEGER NULL,
    `GiaNhap` DECIMAL(15, 2) NOT NULL,
    `GiaBanLe` DECIMAL(15, 2) NOT NULL,
    `SoLuongTon` INTEGER NULL DEFAULT 0,
    `TonKhoToiThieu` INTEGER NULL DEFAULT 10,
    `MoTa` TEXT NULL,
    `HinhAnh` LONGTEXT NULL,
    `Barcode` VARCHAR(100) NULL,
    `SoTrang` INTEGER NULL,
    `TrongLuong` INTEGER NULL,
    `KichThuoc` VARCHAR(50) NULL,
    `NamXuatBan` INTEGER NULL,
    UNIQUE INDEX `sach_ISBN_key`(`ISBN`),
    PRIMARY KEY (`MaSach`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable tacgia
CREATE TABLE IF NOT EXISTS `tacgia` (
    `MaTacGia` INTEGER NOT NULL AUTO_INCREMENT,
    `TenTacGia` VARCHAR(100) NOT NULL,
    PRIMARY KEY (`MaTacGia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable sach_tacgia
CREATE TABLE IF NOT EXISTS `sach_tacgia` (
    `MaSach` INTEGER NOT NULL,
    `MaTacGia` INTEGER NOT NULL,
    PRIMARY KEY (`MaSach`, `MaTacGia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable hoadonbansach
CREATE TABLE IF NOT EXISTS `hoadonbansach` (
    `MaHoaDon` INTEGER NOT NULL AUTO_INCREMENT,
    `MaNV` INTEGER NOT NULL,
    `MaKH` INTEGER NULL,
    `NgayBan` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TongTien` DECIMAL(15, 2) NULL,
    `TienGiamGia` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `ThanhTien` DECIMAL(15, 2) NULL,
    PRIMARY KEY (`MaHoaDon`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable chitiethoadon
CREATE TABLE IF NOT EXISTS `chitiethoadon` (
    `MaCTHD` INTEGER NOT NULL AUTO_INCREMENT,
    `MaHoaDon` INTEGER NULL,
    `MaSach` INTEGER NULL,
    `SoLuongBan` INTEGER NOT NULL,
    `GiaBan` DECIMAL(15, 2) NOT NULL,
    `ThanhTien` DECIMAL(15, 2) NULL,
    PRIMARY KEY (`MaCTHD`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable phieunhapsach
CREATE TABLE IF NOT EXISTS `phieunhapsach` (
    `MaPhieuNhap` INTEGER NOT NULL AUTO_INCREMENT,
    `MaNV` INTEGER NOT NULL,
    `NgayNhap` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TongTienNhap` DECIMAL(15, 2) NULL,
    PRIMARY KEY (`MaPhieuNhap`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable chitietphieunhap
CREATE TABLE IF NOT EXISTS `chitietphieunhap` (
    `MaCTPN` INTEGER NOT NULL AUTO_INCREMENT,
    `MaPhieuNhap` INTEGER NULL,
    `MaSach` INTEGER NULL,
    `SoLuongNhap` INTEGER NOT NULL,
    `GiaNhap` DECIMAL(15, 2) NOT NULL,
    `ThanhTien` DECIMAL(15, 2) NULL,
    PRIMARY KEY (`MaCTPN`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable phieuthutien
CREATE TABLE IF NOT EXISTS `phieuthutien` (
    `MaPhieuThu` INTEGER NOT NULL AUTO_INCREMENT,
    `MaHoaDon` INTEGER NOT NULL,
    `SoTienThu` DECIMAL(15, 2) NOT NULL,
    `NgayThu` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `PhuongThucThanhToan` ENUM('TIEN_MAT', 'THE_NGAN_HANG', 'VI_DIEN_TU') NOT NULL,
    PRIMARY KEY (`MaPhieuThu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable quydinh
CREATE TABLE IF NOT EXISTS `quydinh` (
    `MaQuyDinh` INTEGER NOT NULL AUTO_INCREMENT,
    `TenQuyDinh` VARCHAR(255) NOT NULL,
    `GiaTri` TEXT NOT NULL,
    `MoTa` VARCHAR(500) NULL,
    `NgayCapNhat` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `quydinh_TenQuyDinh_key`(`TenQuyDinh`),
    PRIMARY KEY (`MaQuyDinh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =============================================
-- PHẦN 2: NHẬP DỮ LIỆU
-- =============================================

-- NHÂN VIÊN (5 người - password: 123456)
INSERT INTO nhanvien (TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, VaiTro, TrangThai) VALUES
('admin', '$2b$10$sL.54BCX.Nr0dhmfMROZ7.U9cS07Unx8MBe4EH1CEmhTOQgWnCRYa', 'Nguyễn Văn Quản Lý', 'admin@bookstore.com', '0901000001', 'QUAN_LY', 1),
('thukho01', '$2b$10$sL.54BCX.Nr0dhmfMROZ7.U9cS07Unx8MBe4EH1CEmhTOQgWnCRYa', 'Trần Thị Kho', 'thukho01@bookstore.com', '0901000002', 'THU_KHO', 1),
('thukho02', '$2b$10$sL.54BCX.Nr0dhmfMROZ7.U9cS07Unx8MBe4EH1CEmhTOQgWnCRYa', 'Lê Văn Kho Hai', 'thukho02@bookstore.com', '0901000003', 'THU_KHO', 1),
('thungan01', '$2b$10$sL.54BCX.Nr0dhmfMROZ7.U9cS07Unx8MBe4EH1CEmhTOQgWnCRYa', 'Phạm Thị Thu Ngân', 'thungan01@bookstore.com', '0901000004', 'THU_NGAN', 1),
('thungan02', '$2b$10$sL.54BCX.Nr0dhmfMROZ7.U9cS07Unx8MBe4EH1CEmhTOQgWnCRYa', 'Hoàng Văn Ngân', 'thungan02@bookstore.com', '0901000005', 'THU_NGAN', 1);

-- THỂ LOẠI (10 thể loại)
INSERT INTO theloai (TenTheLoai) VALUES
('Văn học Việt Nam'),
('Văn học nước ngoài'),
('Kinh tế - Kinh doanh'),
('Kỹ năng sống'),
('Tâm lý - Tự lực'),
('Thiếu nhi'),
('Giáo khoa - Tham khảo'),
('Khoa học - Công nghệ'),
('Lịch sử - Địa lý'),
('Truyện tranh');

-- NHÀ XUẤT BẢN (8 NXB)
INSERT INTO nhaxuatban (TenNXB, DiaChi, SoDienThoai) VALUES
('NXB Trẻ', '161B Lý Chính Thắng, Q.3, TP.HCM', '028-39316289'),
('NXB Kim Đồng', '55 Quang Trung, Hà Nội', '024-39434730'),
('NXB Tổng hợp TP.HCM', '62 Nguyễn Thị Minh Khai, Q.1', '028-38256804'),
('NXB Văn học', '18 Nguyễn Trường Tộ, Hà Nội', '024-37161518'),
('NXB Hội Nhà văn', '65 Nguyễn Du, Hà Nội', '024-38222135'),
('NXB Lao động', '175 Giảng Võ, Hà Nội', '024-38515380'),
('NXB Thế giới', '46 Trần Hưng Đạo, Hà Nội', '024-38253841'),
('NXB Phụ nữ', '39 Hàng Chuối, Hà Nội', '024-39717979');

-- TÁC GIẢ (15 tác giả)
INSERT INTO tacgia (TenTacGia) VALUES
('Nguyễn Nhật Ánh'),
('Nguyễn Ngọc Tư'),
('Dale Carnegie'),
('Paulo Coelho'),
('Rosie Nguyễn'),
('Robin Sharma'),
('Nguyễn Phong Việt'),
('Hamlet Trương'),
('Tô Hoài'),
('Nam Cao'),
('Vũ Trọng Phụng'),
('Ngô Tất Tố'),
('Robert Kiyosaki'),
('Napoleon Hill'),
('Tony Buzan');

-- SÁCH (30 cuốn sách thực tế với hình ảnh placeholder đáng tin cậy)
INSERT INTO sach (ISBN, TenSach, MaTheLoai, MaNXB, GiaNhap, GiaBanLe, SoLuongTon, TonKhoToiThieu, MoTa, HinhAnh, SoTrang, TrongLuong, KichThuoc, NamXuatBan) VALUES
('9786041234567', 'Mắt Biếc', 1, 1, 85000, 110000, 45, 10, 'Truyện dài lãng mạn của nhà văn Nguyễn Nhật Ánh.', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', 296, 250, '13x20.5 cm', 2019),
('9786041234568', 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 1, 1, 95000, 125000, 38, 10, 'Câu chuyện về tuổi thơ miền quê trong trẻo.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', 378, 380, '14.5x20.5 cm', 2018),
('9786041234569', 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', 1, 1, 72000, 95000, 52, 10, 'Tự truyện về tuổi thơ của nhà văn.', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop', 218, 230, '13x20.5 cm', 2018),
('9786041234570', 'Cánh Đồng Bất Tận', 1, 1, 65000, 85000, 28, 10, 'Truyện ngắn về cuộc sống miền Tây sông nước.', 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop', 224, 220, '13x20.5 cm', 2017),
('9786041234571', 'Đắc Nhân Tâm', 4, 3, 68000, 88000, 120, 15, 'Nghệ thuật thu phục lòng người.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop', 320, 300, '14.5x20.5 cm', 2016),
('9786041234572', 'Nhà Giả Kim', 2, 4, 60000, 79000, 85, 10, 'Hành trình theo đuổi ước mơ của cậu bé chăn cừu.', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop', 228, 220, '13x20.5 cm', 2020),
('9786041234573', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 4, 5, 70000, 90000, 67, 10, 'Sách self-help dành cho người trẻ.', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=300&h=400&fit=crop', 285, 280, '13x20.5 cm', 2017),
('9786041234574', 'Đời Ngắn Đừng Ngủ Dài', 4, 3, 75000, 99000, 43, 10, 'Triết lý sống tích cực.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=400&fit=crop', 168, 180, '12x20 cm', 2019),
('9786041234575', 'Dế Mèn Phiêu Lưu Ký', 6, 2, 35000, 45000, 95, 15, 'Truyện thiếu nhi kinh điển Việt Nam.', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', 192, 200, '14.5x20.5 cm', 2020),
('9786041234576', 'Chí Phèo', 1, 4, 30000, 39000, 78, 10, 'Truyện ngắn hiện thực phê phán nổi tiếng.', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=300&h=400&fit=crop', 80, 100, '13x19 cm', 2018),
('9786041234577', 'Số Đỏ', 1, 4, 58000, 75000, 55, 10, 'Tiểu thuyết trào phúng đỉnh cao.', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop', 320, 350, '14.5x20.5 cm', 2017),
('9786041234578', 'Tắt Đèn', 1, 4, 42000, 55000, 62, 10, 'Tiểu thuyết về người nông dân.', 'https://images.unsplash.com/photo-1512045482940-f37f5216f639?w=300&h=400&fit=crop', 256, 280, '14.5x20.5 cm', 2019),
('9786041234579', 'Cha Giàu Cha Nghèo', 3, 3, 108000, 140000, 75, 15, 'Sách về tài chính cá nhân.', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=300&h=400&fit=crop', 368, 400, '15.5x23 cm', 2020),
('9786041234580', 'Nghĩ Giàu Làm Giàu', 3, 6, 85000, 110000, 48, 10, 'Triết lý thành công.', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300&h=400&fit=crop', 352, 380, '14.5x20.5 cm', 2019),
('9786041234581', 'Bản Đồ Tư Duy', 8, 1, 96000, 125000, 35, 10, 'Phương pháp tư duy Mind Map.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop', 280, 320, '15.5x23 cm', 2018),
('9786041234582', 'Ngày Xưa Có Một Chuyện Tình', 1, 1, 88000, 115000, 42, 10, 'Truyện tình cảm lãng mạn.', 'https://images.unsplash.com/photo-1474932430478-367dbb6832c1?w=300&h=400&fit=crop', 285, 280, '13x20.5 cm', 2016),
('9786041234583', 'Lược Sử Thời Gian', 8, 7, 115000, 150000, 25, 10, 'Khám phá vũ trụ và thời gian.', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&h=400&fit=crop', 280, 320, '14.5x20.5 cm', 2017),
('9786041234584', 'Sapiens: Lược Sử Loài Người', 9, 7, 145000, 189000, 32, 10, 'Lịch sử tiến hóa của loài người.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', 560, 550, '15.5x23 cm', 2019),
('9786041234585', 'Nhật Ký Đặng Thùy Trâm', 9, 5, 65000, 85000, 28, 10, 'Nhật ký thời chiến cảm động.', 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop', 320, 280, '14x21 cm', 2015),
('9786041234586', 'Doraemon Tập 1', 10, 2, 19000, 25000, 150, 20, 'Truyện tranh về chú mèo máy.', 'https://images.unsplash.com/photo-1618588507085-c79565432917?w=300&h=400&fit=crop', 48, 80, '11.5x17.5 cm', 2020),
('9786041234587', 'Conan Tập 1', 10, 2, 19000, 25000, 130, 20, 'Truyện tranh thám tử nổi tiếng.', 'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=300&h=400&fit=crop', 52, 85, '11.5x17.5 cm', 2020),
('9786041234588', 'Thép Đã Tôi Thế Đấy', 2, 4, 68000, 89000, 38, 10, 'Tiểu thuyết Liên Xô kinh điển.', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop', 544, 480, '14.5x20.5 cm', 2018),
('9786041234589', 'Đọc Vị Bất Kỳ Ai', 5, 6, 75000, 98000, 55, 10, 'Tâm lý học ứng dụng.', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop', 208, 220, '13x20.5 cm', 2019),
('9786041234590', 'Không Gia Đình', 2, 2, 58000, 75000, 45, 10, 'Truyện thiếu nhi cổ điển Pháp.', 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&h=400&fit=crop', 416, 400, '14.5x20.5 cm', 2017),
('9786041234591', 'Harry Potter Và Hòn Đá Phù Thủy', 2, 1, 112000, 145000, 68, 15, 'Tiểu thuyết fantasy nổi tiếng.', 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&h=400&fit=crop', 366, 380, '14.5x20.5 cm', 2020),
('9786041234592', 'Hoàng Tử Bé', 2, 5, 50000, 65000, 88, 10, 'Truyện ngụ ngôn triết học.', 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=300&h=400&fit=crop', 128, 150, '14x21 cm', 2019),
('9786041234593', 'Muôn Kiếp Nhân Sinh', 5, 3, 145000, 188000, 52, 10, 'Sách về tâm linh và nhân sinh.', 'https://images.unsplash.com/photo-1499257398675-8e0c8ec6fea4?w=300&h=400&fit=crop', 504, 500, '15.5x23 cm', 2020),
('9786041234594', 'Bí Mật Tư Duy Triệu Phú', 3, 1, 92000, 120000, 42, 10, 'Tư duy làm giàu.', 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=300&h=400&fit=crop', 320, 350, '14.5x20.5 cm', 2018),
('9786041234595', 'Người Giàu Nhất Thành Babylon', 3, 3, 65000, 85000, 65, 10, 'Bí quyết tài chính cổ điển.', 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=300&h=400&fit=crop', 256, 280, '14.5x20.5 cm', 2017),
('9786041234596', 'Hạt Giống Tâm Hồn', 4, 3, 73000, 95000, 78, 10, 'Những câu chuyện truyền cảm hứng.', 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=300&h=400&fit=crop', 288, 300, '13x20.5 cm', 2019);

-- LIÊN KẾT SÁCH - TÁC GIẢ
INSERT INTO sach_tacgia (MaSach, MaTacGia) VALUES
(1, 1), (2, 1), (3, 1), (4, 2), (5, 3), (6, 4), (7, 5), (8, 6),
(9, 9), (10, 10), (11, 11), (12, 12), (13, 13), (14, 14), (15, 15),
(16, 1), (17, 15), (18, 15), (19, 10), (20, 9), (21, 9), (22, 10),
(23, 14), (24, 10), (25, 3), (26, 4), (27, 7), (28, 6), (29, 14), (30, 5);

-- KHÁCH HÀNG (20 khách)
INSERT INTO khachhang (TenKH, SoDienThoai, Email, DiaChi, DiemTichLuy) VALUES
('Nguyễn Văn An', '0901234567', 'an.nguyen@gmail.com', '123 Lê Lợi, Q.1, TP.HCM', 1500),
('Trần Thị Bình', '0912345678', 'binh.tran@gmail.com', '456 Nguyễn Huệ, Q.1, TP.HCM', 2300),
('Lê Hoàng Cường', '0923456789', 'cuong.le@gmail.com', '789 Hai Bà Trưng, Q.3, TP.HCM', 850),
('Phạm Thị Dung', '0934567890', 'dung.pham@gmail.com', '321 Võ Văn Tần, Q.3, TP.HCM', 1200),
('Hoàng Văn Em', '0945678901', 'em.hoang@gmail.com', '654 Điện Biên Phủ, Bình Thạnh', 3500),
('Vũ Thị Phương', '0956789012', 'phuong.vu@gmail.com', '987 Cách Mạng Tháng 8, Q.10', 980),
('Đặng Quốc Giang', '0967890123', 'giang.dang@gmail.com', '147 Lý Thường Kiệt, Q.11', 2100),
('Bùi Thị Hương', '0978901234', 'huong.bui@gmail.com', '258 Trường Chinh, Tân Bình', 1650),
('Ngô Văn Khang', '0989012345', 'khang.ngo@gmail.com', '369 Hoàng Văn Thụ, Tân Bình', 750),
('Lý Thị Lan', '0990123456', 'lan.ly@gmail.com', '741 Nguyễn Văn Trỗi, Phú Nhuận', 4200),
('Trịnh Văn Minh', '0901122334', 'minh.trinh@gmail.com', '852 Phan Xích Long, Phú Nhuận', 1100),
('Đinh Thị Ngọc', '0912233445', 'ngoc.dinh@gmail.com', '963 Lê Văn Sỹ, Q.3', 2800),
('Phan Văn Phú', '0923344556', 'phu.phan@gmail.com', '159 Nguyễn Đình Chiểu, Q.3', 560),
('Dương Thị Quỳnh', '0934455667', 'quynh.duong@gmail.com', '267 Trần Hưng Đạo, Q.1', 1900),
('Tạ Văn Sơn', '0945566778', 'son.ta@gmail.com', '378 Bùi Viện, Q.1', 3100),
('Chu Thị Thảo', '0956677889', 'thao.chu@gmail.com', '489 Phạm Ngũ Lão, Q.1', 680),
('Lưu Văn Uy', '0967788990', 'uy.luu@gmail.com', '591 Nguyễn Trãi, Q.5', 2400),
('Mai Thị Vân', '0978899001', 'van.mai@gmail.com', '602 An Dương Vương, Q.5', 1350),
('Hồ Văn Xuân', '0989900112', 'xuan.ho@gmail.com', '713 Hùng Vương, Q.6', 890),
('Cao Thị Yến', '0990011223', 'yen.cao@gmail.com', '824 Kinh Dương Vương, Q.6', 2650);

-- QUY ĐỊNH
INSERT INTO quydinh (TenQuyDinh, GiaTri, MoTa) VALUES
('SoLuongNhapToiThieu', '10', 'Số lượng nhập ít nhất cho mỗi đầu sách'),
('TonKhoToiThieu', '20', 'Mức tồn kho báo động cần nhập thêm'),
('TyLeLoiNhuan', '1.3', 'Tỷ lệ lợi nhuận tối thiểu (30%)'),
('DiemDoiToiThieu', '100', 'Điểm tích lũy tối thiểu để đổi'),
('TyLeTinhDiem', '0.01', 'Tỷ lệ tính điểm (1% giá trị đơn hàng)');

-- PHIẾU NHẬP SÁCH (3 phiếu)
INSERT INTO phieunhapsach (MaNV, TongTienNhap) VALUES
(2, 25000000),
(3, 18500000),
(2, 15200000);

-- CHI TIẾT PHIẾU NHẬP
INSERT INTO chitietphieunhap (MaPhieuNhap, MaSach, SoLuongNhap, GiaNhap, ThanhTien) VALUES
(1, 1, 50, 85000, 4250000),
(1, 2, 40, 95000, 3800000),
(1, 5, 80, 68000, 5440000),
(1, 6, 50, 60000, 3000000),
(1, 13, 60, 108000, 6480000),
(2, 3, 30, 72000, 2160000),
(2, 7, 40, 70000, 2800000),
(2, 8, 35, 75000, 2625000),
(2, 9, 50, 35000, 1750000),
(2, 25, 45, 112000, 5040000),
(3, 20, 100, 19000, 1900000),
(3, 21, 100, 19000, 1900000),
(3, 26, 80, 50000, 4000000),
(3, 27, 40, 145000, 5800000);

-- =============================================
-- PHẦN 3: TẠO HÓA ĐƠN BÁN SÁCH (6 tháng dữ liệu)
-- =============================================

DELIMITER //

DROP PROCEDURE IF EXISTS GenerateSalesData//

CREATE PROCEDURE GenerateSalesData()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE j INT;
    DECLARE ordersPerMonth INT;
    DECLARE orderDate DATE;
    DECLARE randomNV INT;
    DECLARE randomKH INT;
    DECLARE randomSach INT;
    DECLARE randomQty INT;
    DECLARE bookPrice DECIMAL(15,2);
    DECLARE orderTotal DECIMAL(15,2);
    DECLARE lastOrderId INT;
    DECLARE monthOffset INT;
    DECLARE paymentMethod VARCHAR(20);
    
    SET monthOffset = 5;
    
    WHILE monthOffset >= 0 DO
        SET ordersPerMonth = 25 + FLOOR(RAND() * 15);
        SET i = 0;
        
        WHILE i < ordersPerMonth DO
            SET orderDate = DATE_SUB(CURDATE(), INTERVAL monthOffset MONTH);
            SET orderDate = DATE_ADD(DATE_FORMAT(orderDate, '%Y-%m-01'), INTERVAL FLOOR(RAND() * 27) DAY);
            
            -- Fix: Ensure orderDate is not in the future
            IF orderDate > CURDATE() THEN
                SET orderDate = CURDATE();
            END IF;
            
            INSERT INTO hoadonbansach (MaNV, MaKH, NgayBan, TongTien, TienGiamGia, ThanhTien)
            VALUES (randomNV, randomKH, orderDate, 0, 0, 0);
            
            SET lastOrderId = LAST_INSERT_ID();
            SET orderTotal = 0;
            SET j = 1 + FLOOR(RAND() * 4);
            
            WHILE j > 0 DO
                SET randomSach = 1 + FLOOR(RAND() * 30);
                SET randomQty = 1 + FLOOR(RAND() * 3);
                SELECT GiaBanLe INTO bookPrice FROM sach WHERE MaSach = randomSach LIMIT 1;
                
                IF bookPrice IS NOT NULL THEN
                    INSERT INTO chitiethoadon (MaHoaDon, MaSach, SoLuongBan, GiaBan, ThanhTien)
                    VALUES (lastOrderId, randomSach, randomQty, bookPrice, randomQty * bookPrice);
                    SET orderTotal = orderTotal + (randomQty * bookPrice);
                END IF;
                
                SET j = j - 1;
            END WHILE;
            
            UPDATE hoadonbansach SET TongTien = orderTotal, ThanhTien = orderTotal WHERE MaHoaDon = lastOrderId;
            SET paymentMethod = ELT(1 + FLOOR(RAND() * 3), 'TIEN_MAT', 'THE_NGAN_HANG', 'VI_DIEN_TU');
            
            INSERT INTO phieuthutien (MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan)
            VALUES (lastOrderId, orderTotal, orderDate, paymentMethod);
            
            SET i = i + 1;
        END WHILE;
        
        SET monthOffset = monthOffset - 1;
    END WHILE;
END//

DELIMITER ;

CALL GenerateSalesData();
DROP PROCEDURE IF EXISTS GenerateSalesData;

-- =============================================
-- TẠO PHIẾU THU TIỀN (Payment Receipts)
-- =============================================
-- Tạo phiếu thu cho ~70% hóa đơn có khách hàng
INSERT INTO phieuthutien (MaKH, NgayThu, SoTienThu)
SELECT 
    hd.MaKH,
    LEAST(CURDATE(), DATE_ADD(hd.NgayBan, INTERVAL FLOOR(1 + RAND() * 14) DAY)) as NgayThu,
    FLOOR(hd.ThanhTien * (0.3 + RAND() * 0.7)) as SoTienThu
FROM hoadonbansach hd
WHERE hd.MaKH IS NOT NULL 
    AND RAND() > 0.3
ORDER BY hd.NgayBan
LIMIT 100;

-- =============================================
-- KIỂM TRA KẾT QUẢ
-- =============================================
SELECT 'Nhân viên' as 'Bảng', COUNT(*) as 'Số dòng' FROM nhanvien
UNION ALL SELECT 'Sách', COUNT(*) FROM sach
UNION ALL SELECT 'Khách hàng', COUNT(*) FROM khachhang
UNION ALL SELECT 'Hóa đơn', COUNT(*) FROM hoadonbansach
UNION ALL SELECT 'Chi tiết hóa đơn', COUNT(*) FROM chitiethoadon
UNION ALL SELECT 'Phiếu thu', COUNT(*) FROM phieuthutien;
