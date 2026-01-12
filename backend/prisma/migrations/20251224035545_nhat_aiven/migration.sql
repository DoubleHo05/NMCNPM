-- CreateTable
CREATE TABLE `nhanvien` (
    `MaNV` INTEGER NOT NULL AUTO_INCREMENT,
    `TenDangNhap` VARCHAR(50) NOT NULL,
    `MatKhau` VARCHAR(255) NOT NULL,
    `HoTen` VARCHAR(100) NOT NULL,
    `VaiTro` ENUM('THU_KHO', 'THU_NGAN', 'QUAN_LY') NOT NULL,
    `TrangThai` BOOLEAN NULL DEFAULT true,

    UNIQUE INDEX `nhanvien_TenDangNhap_key`(`TenDangNhap`),
    PRIMARY KEY (`MaNV`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `khachhang` (
    `MaKH` INTEGER NOT NULL AUTO_INCREMENT,
    `TenKH` VARCHAR(100) NULL,
    `SoDienThoai` VARCHAR(20) NULL,
    `Email` VARCHAR(100) NULL,
    `DiemTichLuy` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`MaKH`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `theloai` (
    `MaTheLoai` INTEGER NOT NULL AUTO_INCREMENT,
    `TenTheLoai` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `theloai_TenTheLoai_key`(`TenTheLoai`),
    PRIMARY KEY (`MaTheLoai`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nhaxuatban` (
    `MaNXB` INTEGER NOT NULL AUTO_INCREMENT,
    `TenNXB` VARCHAR(255) NOT NULL,
    `DiaChi` VARCHAR(500) NULL,
    `SoDienThoai` VARCHAR(20) NULL,

    UNIQUE INDEX `nhaxuatban_TenNXB_key`(`TenNXB`),
    PRIMARY KEY (`MaNXB`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sach` (
    `MaSach` INTEGER NOT NULL AUTO_INCREMENT,
    `ISBN` VARCHAR(20) NULL,
    `TenSach` VARCHAR(500) NOT NULL,
    `MaTheLoai` INTEGER NULL,
    `MaNXB` INTEGER NULL,
    `GiaNhap` DECIMAL(15, 2) NOT NULL,
    `GiaBanLe` DECIMAL(15, 2) NOT NULL,
    `SoLuongTon` INTEGER NULL DEFAULT 0,
    `MoTa` TEXT NULL,
    `Barcode` VARCHAR(100) NULL,

    UNIQUE INDEX `sach_ISBN_key`(`ISBN`),
    PRIMARY KEY (`MaSach`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tacgia` (
    `MaTacGia` INTEGER NOT NULL AUTO_INCREMENT,
    `TenTacGia` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`MaTacGia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sach_tacgia` (
    `MaSach` INTEGER NOT NULL,
    `MaTacGia` INTEGER NOT NULL,

    PRIMARY KEY (`MaSach`, `MaTacGia`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hoadonbansach` (
    `MaHoaDon` INTEGER NOT NULL AUTO_INCREMENT,
    `MaNV` INTEGER NOT NULL,
    `MaKH` INTEGER NULL,
    `NgayBan` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TongTien` DECIMAL(15, 2) NULL,
    `TienGiamGia` DECIMAL(15, 2) NULL DEFAULT 0.00,
    `ThanhTien` DECIMAL(15, 2) NULL,

    PRIMARY KEY (`MaHoaDon`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitiethoadon` (
    `MaCTHD` INTEGER NOT NULL AUTO_INCREMENT,
    `MaHoaDon` INTEGER NULL,
    `MaSach` INTEGER NULL,
    `SoLuongBan` INTEGER NOT NULL,
    `GiaBan` DECIMAL(15, 2) NOT NULL,
    `ThanhTien` DECIMAL(15, 2) NULL,

    PRIMARY KEY (`MaCTHD`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phieunhapsach` (
    `MaPhieuNhap` INTEGER NOT NULL AUTO_INCREMENT,
    `MaNV` INTEGER NOT NULL,
    `NgayNhap` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `TongTienNhap` DECIMAL(15, 2) NULL,

    PRIMARY KEY (`MaPhieuNhap`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitietphieunhap` (
    `MaCTPN` INTEGER NOT NULL AUTO_INCREMENT,
    `MaPhieuNhap` INTEGER NULL,
    `MaSach` INTEGER NULL,
    `SoLuongNhap` INTEGER NOT NULL,
    `GiaNhap` DECIMAL(15, 2) NOT NULL,
    `ThanhTien` DECIMAL(15, 2) NULL,

    PRIMARY KEY (`MaCTPN`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phieuthutien` (
    `MaPhieuThu` INTEGER NOT NULL AUTO_INCREMENT,
    `MaHoaDon` INTEGER NOT NULL,
    `SoTienThu` DECIMAL(15, 2) NOT NULL,
    `NgayThu` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `PhuongThucThanhToan` ENUM('TIEN_MAT', 'THE_NGAN_HANG', 'VI_DIEN_TU') NOT NULL,

    PRIMARY KEY (`MaPhieuThu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quydinh` (
    `MaQuyDinh` INTEGER NOT NULL AUTO_INCREMENT,
    `TenQuyDinh` VARCHAR(255) NOT NULL,
    `GiaTri` TEXT NOT NULL,
    `MoTa` VARCHAR(500) NULL,
    `NgayCapNhat` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `quydinh_TenQuyDinh_key`(`TenQuyDinh`),
    PRIMARY KEY (`MaQuyDinh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sach` ADD CONSTRAINT `sach_MaTheLoai_fkey` FOREIGN KEY (`MaTheLoai`) REFERENCES `theloai`(`MaTheLoai`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sach` ADD CONSTRAINT `sach_MaNXB_fkey` FOREIGN KEY (`MaNXB`) REFERENCES `nhaxuatban`(`MaNXB`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sach_tacgia` ADD CONSTRAINT `sach_tacgia_MaSach_fkey` FOREIGN KEY (`MaSach`) REFERENCES `sach`(`MaSach`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sach_tacgia` ADD CONSTRAINT `sach_tacgia_MaTacGia_fkey` FOREIGN KEY (`MaTacGia`) REFERENCES `tacgia`(`MaTacGia`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hoadonbansach` ADD CONSTRAINT `hoadonbansach_MaNV_fkey` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien`(`MaNV`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hoadonbansach` ADD CONSTRAINT `hoadonbansach_MaKH_fkey` FOREIGN KEY (`MaKH`) REFERENCES `khachhang`(`MaKH`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitiethoadon` ADD CONSTRAINT `chitiethoadon_MaHoaDon_fkey` FOREIGN KEY (`MaHoaDon`) REFERENCES `hoadonbansach`(`MaHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitiethoadon` ADD CONSTRAINT `chitiethoadon_MaSach_fkey` FOREIGN KEY (`MaSach`) REFERENCES `sach`(`MaSach`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieunhapsach` ADD CONSTRAINT `phieunhapsach_MaNV_fkey` FOREIGN KEY (`MaNV`) REFERENCES `nhanvien`(`MaNV`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitietphieunhap` ADD CONSTRAINT `chitietphieunhap_MaPhieuNhap_fkey` FOREIGN KEY (`MaPhieuNhap`) REFERENCES `phieunhapsach`(`MaPhieuNhap`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitietphieunhap` ADD CONSTRAINT `chitietphieunhap_MaSach_fkey` FOREIGN KEY (`MaSach`) REFERENCES `sach`(`MaSach`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieuthutien` ADD CONSTRAINT `phieuthutien_MaHoaDon_fkey` FOREIGN KEY (`MaHoaDon`) REFERENCES `hoadonbansach`(`MaHoaDon`) ON DELETE RESTRICT ON UPDATE CASCADE;
