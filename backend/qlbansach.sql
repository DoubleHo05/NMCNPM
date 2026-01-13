-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema bansach
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bansach
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bansach` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
-- -----------------------------------------------------
-- Schema bookstoremanagement
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bookstoremanagement
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bookstoremanagement` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `bansach` ;

-- -----------------------------------------------------
-- Table `bansach`.`baocaodoanhthu`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`baocaodoanhthu` ;

CREATE TABLE IF NOT EXISTS `bansach`.`baocaodoanhthu` (
  `MaBaoCao` INT NOT NULL AUTO_INCREMENT,
  `ThangBaoCao` INT NOT NULL,
  `NamBaoCao` INT NOT NULL,
  `TongDoanhThu` DECIMAL(15,2) NULL DEFAULT NULL,
  `TongLoiNhuan` DECIMAL(15,2) NULL DEFAULT NULL,
  `NgayTao` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaBaoCao`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`baocaotonkho`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`baocaotonkho` ;

CREATE TABLE IF NOT EXISTS `bansach`.`baocaotonkho` (
  `MaBaoCao` INT NOT NULL AUTO_INCREMENT,
  `ThangBaoCao` INT NOT NULL,
  `NamBaoCao` INT NOT NULL,
  `TongSoLuongTon` INT NULL DEFAULT NULL,
  `TongGiaTriTonKho` DECIMAL(15,2) NULL DEFAULT NULL,
  `NgayTao` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaBaoCao`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`nhanvien`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`nhanvien` ;

CREATE TABLE IF NOT EXISTS `bansach`.`nhanvien` (
  `MaNV` INT NOT NULL AUTO_INCREMENT,
  `TenDangNhap` VARCHAR(50) NOT NULL,
  `MatKhau` VARCHAR(255) NOT NULL,
  `HoTen` VARCHAR(100) CHARACTER SET 'utf8mb3' NOT NULL,
  `VaiTro` ENUM('THU_KHO', 'THU_NGAN', 'QUAN_LY') NOT NULL,
  `TrangThai` TINYINT(1) NULL DEFAULT '1',
  PRIMARY KEY (`MaNV`),
  UNIQUE INDEX `TenDangNhap` (`TenDangNhap` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`khachhang`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`khachhang` ;

CREATE TABLE IF NOT EXISTS `bansach`.`khachhang` (
  `MaKH` INT NOT NULL AUTO_INCREMENT,
  `TenKH` VARCHAR(100) CHARACTER SET 'utf8mb3' NULL DEFAULT NULL,
  `SoDienThoai` VARCHAR(20) NULL DEFAULT NULL,
  `Email` VARCHAR(100) NULL DEFAULT NULL,
  `DiemTichLuy` INT NULL DEFAULT '0',
  PRIMARY KEY (`MaKH`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`hoadonbansach`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`hoadonbansach` ;

CREATE TABLE IF NOT EXISTS `bansach`.`hoadonbansach` (
  `MaHoaDon` INT NOT NULL AUTO_INCREMENT,
  `MaNV` INT NOT NULL,
  `MaKH` INT NULL DEFAULT NULL,
  `NgayBan` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `TongTien` DECIMAL(15,2) NULL DEFAULT NULL,
  `TienGiamGia` DECIMAL(15,2) NULL DEFAULT '0.00',
  `ThanhTien` DECIMAL(15,2) GENERATED ALWAYS AS ((`TongTien` - `TienGiamGia`)) STORED,
  PRIMARY KEY (`MaHoaDon`),
  INDEX `MaNV` (`MaNV` ASC) VISIBLE,
  INDEX `MaKH` (`MaKH` ASC) VISIBLE,
  CONSTRAINT `hoadonbansach_ibfk_1`
    FOREIGN KEY (`MaNV`)
    REFERENCES `bansach`.`nhanvien` (`MaNV`),
  CONSTRAINT `hoadonbansach_ibfk_2`
    FOREIGN KEY (`MaKH`)
    REFERENCES `bansach`.`khachhang` (`MaKH`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`theloai`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`theloai` ;

CREATE TABLE IF NOT EXISTS `bansach`.`theloai` (
  `MaTheLoai` INT NOT NULL AUTO_INCREMENT,
  `TenTheLoai` VARCHAR(100) CHARACTER SET 'utf8mb3' NOT NULL,
  PRIMARY KEY (`MaTheLoai`),
  UNIQUE INDEX `TenTheLoai` (`TenTheLoai` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`nhaxuatban`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`nhaxuatban` ;

CREATE TABLE IF NOT EXISTS `bansach`.`nhaxuatban` (
  `MaNXB` INT NOT NULL AUTO_INCREMENT,
  `TenNXB` VARCHAR(255) CHARACTER SET 'utf8mb3' NOT NULL,
  `DiaChi` VARCHAR(500) CHARACTER SET 'utf8mb3' NULL DEFAULT NULL,
  `SoDienThoai` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`MaNXB`),
  UNIQUE INDEX `TenNXB` (`TenNXB` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`sach`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`sach` ;

CREATE TABLE IF NOT EXISTS `bansach`.`sach` (
  `MaSach` INT NOT NULL AUTO_INCREMENT,
  `ISBN` VARCHAR(20) NULL DEFAULT NULL,
  `TenSach` VARCHAR(500) CHARACTER SET 'utf8mb3' NOT NULL,
  `MaTheLoai` INT NULL DEFAULT NULL,
  `MaNXB` INT NULL DEFAULT NULL,
  `GiaNhap` DECIMAL(15,2) NOT NULL,
  `GiaBanLe` DECIMAL(15,2) NOT NULL,
  `SoLuongTon` INT NULL DEFAULT '0',
  `MoTa` TEXT NULL DEFAULT NULL,
  `Barcode` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`MaSach`),
  UNIQUE INDEX `ISBN` (`ISBN` ASC) VISIBLE,
  INDEX `MaTheLoai` (`MaTheLoai` ASC) VISIBLE,
  INDEX `MaNXB` (`MaNXB` ASC) VISIBLE,
  CONSTRAINT `sach_ibfk_1`
    FOREIGN KEY (`MaTheLoai`)
    REFERENCES `bansach`.`theloai` (`MaTheLoai`),
  CONSTRAINT `sach_ibfk_2`
    FOREIGN KEY (`MaNXB`)
    REFERENCES `bansach`.`nhaxuatban` (`MaNXB`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`chitiethoadon`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`chitiethoadon` ;

CREATE TABLE IF NOT EXISTS `bansach`.`chitiethoadon` (
  `MaCTHD` INT NOT NULL AUTO_INCREMENT,
  `MaHoaDon` INT NULL DEFAULT NULL,
  `MaSach` INT NULL DEFAULT NULL,
  `SoLuongBan` INT NOT NULL,
  `GiaBan` DECIMAL(15,2) NOT NULL,
  `ThanhTien` DECIMAL(15,2) GENERATED ALWAYS AS ((`SoLuongBan` * `GiaBan`)) STORED,
  PRIMARY KEY (`MaCTHD`),
  INDEX `MaHoaDon` (`MaHoaDon` ASC) VISIBLE,
  INDEX `MaSach` (`MaSach` ASC) VISIBLE,
  CONSTRAINT `chitiethoadon_ibfk_1`
    FOREIGN KEY (`MaHoaDon`)
    REFERENCES `bansach`.`hoadonbansach` (`MaHoaDon`),
  CONSTRAINT `chitiethoadon_ibfk_2`
    FOREIGN KEY (`MaSach`)
    REFERENCES `bansach`.`sach` (`MaSach`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`phieunhapsach`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`phieunhapsach` ;

CREATE TABLE IF NOT EXISTS `bansach`.`phieunhapsach` (
  `MaPhieuNhap` INT NOT NULL AUTO_INCREMENT,
  `MaNV` INT NOT NULL,
  `NgayNhap` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `TongTienNhap` DECIMAL(15,2) NULL DEFAULT NULL,
  PRIMARY KEY (`MaPhieuNhap`),
  INDEX `MaNV` (`MaNV` ASC) VISIBLE,
  CONSTRAINT `phieunhapsach_ibfk_1`
    FOREIGN KEY (`MaNV`)
    REFERENCES `bansach`.`nhanvien` (`MaNV`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`chitietphieunhap`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`chitietphieunhap` ;

CREATE TABLE IF NOT EXISTS `bansach`.`chitietphieunhap` (
  `MaCTPN` INT NOT NULL AUTO_INCREMENT,
  `MaPhieuNhap` INT NULL DEFAULT NULL,
  `MaSach` INT NULL DEFAULT NULL,
  `SoLuongNhap` INT NOT NULL,
  `GiaNhap` DECIMAL(15,2) NOT NULL,
  `ThanhTien` DECIMAL(15,2) GENERATED ALWAYS AS ((`SoLuongNhap` * `GiaNhap`)) STORED,
  PRIMARY KEY (`MaCTPN`),
  INDEX `MaPhieuNhap` (`MaPhieuNhap` ASC) VISIBLE,
  INDEX `MaSach` (`MaSach` ASC) VISIBLE,
  CONSTRAINT `chitietphieunhap_ibfk_1`
    FOREIGN KEY (`MaPhieuNhap`)
    REFERENCES `bansach`.`phieunhapsach` (`MaPhieuNhap`),
  CONSTRAINT `chitietphieunhap_ibfk_2`
    FOREIGN KEY (`MaSach`)
    REFERENCES `bansach`.`sach` (`MaSach`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`phieuthutien`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`phieuthutien` ;

CREATE TABLE IF NOT EXISTS `bansach`.`phieuthutien` (
  `MaPhieuThu` INT NOT NULL AUTO_INCREMENT,
  `MaHoaDon` INT NOT NULL,
  `SoTienThu` DECIMAL(15,2) NOT NULL,
  `NgayThu` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `PhuongThucThanhToan` ENUM('TIEN_MAT', 'THE_NGAN_HANG', 'VI_DIEN_TU') NOT NULL,
  PRIMARY KEY (`MaPhieuThu`),
  INDEX `MaHoaDon` (`MaHoaDon` ASC) VISIBLE,
  CONSTRAINT `phieuthutien_ibfk_1`
    FOREIGN KEY (`MaHoaDon`)
    REFERENCES `bansach`.`hoadonbansach` (`MaHoaDon`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`quydinh`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`quydinh` ;

CREATE TABLE IF NOT EXISTS `bansach`.`quydinh` (
  `MaQuyDinh` INT NOT NULL AUTO_INCREMENT,
  `TenQuyDinh` VARCHAR(255) CHARACTER SET 'utf8mb3' NOT NULL,
  `GiaTri` TEXT NOT NULL,
  `MoTa` VARCHAR(500) CHARACTER SET 'utf8mb3' NULL DEFAULT NULL,
  `NgayCapNhat` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`MaQuyDinh`),
  UNIQUE INDEX `TenQuyDinh` (`TenQuyDinh` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`tacgia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`tacgia` ;

CREATE TABLE IF NOT EXISTS `bansach`.`tacgia` (
  `MaTacGia` INT NOT NULL AUTO_INCREMENT,
  `TenTacGia` VARCHAR(100) CHARACTER SET 'utf8mb3' NOT NULL,
  PRIMARY KEY (`MaTacGia`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bansach`.`sach_tacgia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bansach`.`sach_tacgia` ;

CREATE TABLE IF NOT EXISTS `bansach`.`sach_tacgia` (
  `MaSach` INT NOT NULL,
  `MaTacGia` INT NOT NULL,
  PRIMARY KEY (`MaSach`, `MaTacGia`),
  INDEX `MaTacGia` (`MaTacGia` ASC) VISIBLE,
  CONSTRAINT `sach_tacgia_ibfk_1`
    FOREIGN KEY (`MaSach`)
    REFERENCES `bansach`.`sach` (`MaSach`),
  CONSTRAINT `sach_tacgia_ibfk_2`
    FOREIGN KEY (`MaTacGia`)
    REFERENCES `bansach`.`tacgia` (`MaTacGia`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

USE `bookstoremanagement` ;

-- -----------------------------------------------------
-- Table `bookstoremanagement`.`nhan_vien`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`nhan_vien` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`nhan_vien` (
  `MaNhanVien` INT NOT NULL AUTO_INCREMENT,
  `HoTen` VARCHAR(255) NULL DEFAULT NULL,
  `TenDangNhap` VARCHAR(100) NULL DEFAULT NULL,
  `MatKhau` VARCHAR(255) NULL DEFAULT NULL,
  `LoaiNhanVien` ENUM('THU_KHO', 'THU_NGAN', 'QUAN_LY') NOT NULL,
  PRIMARY KEY (`MaNhanVien`),
  UNIQUE INDEX `TenDangNhap` (`TenDangNhap` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`khach_hang`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`khach_hang` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`khach_hang` (
  `MaKH` INT NOT NULL AUTO_INCREMENT,
  `HoTen` VARCHAR(255) NULL DEFAULT NULL,
  `SoDienThoai` VARCHAR(20) NULL DEFAULT NULL,
  `DiaChi` VARCHAR(255) NULL DEFAULT NULL,
  `MucNoToiDa` DECIMAL(12,2) NULL DEFAULT '0.00',
  PRIMARY KEY (`MaKH`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`hoa_don`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`hoa_don` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`hoa_don` (
  `MaHoaDon` INT NOT NULL AUTO_INCREMENT,
  `NgayLap` DATE NOT NULL,
  `TongTien` DECIMAL(12,2) NULL DEFAULT '0.00',
  `MaNhanVien` INT NOT NULL,
  `MaKH` INT NULL DEFAULT NULL,
  PRIMARY KEY (`MaHoaDon`),
  INDEX `MaNhanVien` (`MaNhanVien` ASC) VISIBLE,
  INDEX `MaKH` (`MaKH` ASC) VISIBLE,
  CONSTRAINT `hoa_don_ibfk_1`
    FOREIGN KEY (`MaNhanVien`)
    REFERENCES `bookstoremanagement`.`nhan_vien` (`MaNhanVien`),
  CONSTRAINT `hoa_don_ibfk_2`
    FOREIGN KEY (`MaKH`)
    REFERENCES `bookstoremanagement`.`khach_hang` (`MaKH`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`nha_xuat_ban`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`nha_xuat_ban` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`nha_xuat_ban` (
  `MaNXB` INT NOT NULL AUTO_INCREMENT,
  `TenNXB` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`MaNXB`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`sach`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`sach` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`sach` (
  `ISBN` VARCHAR(20) NOT NULL,
  `TenSach` VARCHAR(255) NOT NULL,
  `GiaBanLe` DECIMAL(12,2) NOT NULL,
  `SoLuongTon` INT NULL DEFAULT '0',
  `MaNXB` INT NULL DEFAULT NULL,
  PRIMARY KEY (`ISBN`),
  INDEX `MaNXB` (`MaNXB` ASC) VISIBLE,
  CONSTRAINT `sach_ibfk_1`
    FOREIGN KEY (`MaNXB`)
    REFERENCES `bookstoremanagement`.`nha_xuat_ban` (`MaNXB`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`ct_hoa_don`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`ct_hoa_don` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`ct_hoa_don` (
  `MaHoaDon` INT NOT NULL,
  `ISBN` VARCHAR(20) NOT NULL,
  `SoLuongBan` INT NOT NULL,
  `DonGia` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`MaHoaDon`, `ISBN`),
  INDEX `ISBN` (`ISBN` ASC) VISIBLE,
  CONSTRAINT `ct_hoa_don_ibfk_1`
    FOREIGN KEY (`MaHoaDon`)
    REFERENCES `bookstoremanagement`.`hoa_don` (`MaHoaDon`),
  CONSTRAINT `ct_hoa_don_ibfk_2`
    FOREIGN KEY (`ISBN`)
    REFERENCES `bookstoremanagement`.`sach` (`ISBN`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`phieu_nhap`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`phieu_nhap` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`phieu_nhap` (
  `MaPhieuNhap` INT NOT NULL AUTO_INCREMENT,
  `NgayNhap` DATE NOT NULL,
  `MaNhanVien` INT NOT NULL,
  PRIMARY KEY (`MaPhieuNhap`),
  INDEX `MaNhanVien` (`MaNhanVien` ASC) VISIBLE,
  CONSTRAINT `phieu_nhap_ibfk_1`
    FOREIGN KEY (`MaNhanVien`)
    REFERENCES `bookstoremanagement`.`nhan_vien` (`MaNhanVien`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`ct_phieu_nhap`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`ct_phieu_nhap` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`ct_phieu_nhap` (
  `MaPhieuNhap` INT NOT NULL,
  `ISBN` VARCHAR(20) NOT NULL,
  `SoLuongNhap` INT NOT NULL,
  `GiaNhap` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`MaPhieuNhap`, `ISBN`),
  INDEX `ISBN` (`ISBN` ASC) VISIBLE,
  CONSTRAINT `ct_phieu_nhap_ibfk_1`
    FOREIGN KEY (`MaPhieuNhap`)
    REFERENCES `bookstoremanagement`.`phieu_nhap` (`MaPhieuNhap`),
  CONSTRAINT `ct_phieu_nhap_ibfk_2`
    FOREIGN KEY (`ISBN`)
    REFERENCES `bookstoremanagement`.`sach` (`ISBN`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`phieu_thu`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`phieu_thu` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`phieu_thu` (
  `MaPhieuThu` INT NOT NULL AUTO_INCREMENT,
  `NgayThu` DATE NOT NULL,
  `SoTienThu` DECIMAL(12,2) NOT NULL,
  `HinhThucThanhToan` ENUM('TIEN_MAT', 'THE', 'CHUYEN_KHOAN') NOT NULL,
  `MaHoaDon` INT NOT NULL,
  `MaNhanVien` INT NOT NULL,
  PRIMARY KEY (`MaPhieuThu`),
  INDEX `MaHoaDon` (`MaHoaDon` ASC) VISIBLE,
  INDEX `MaNhanVien` (`MaNhanVien` ASC) VISIBLE,
  CONSTRAINT `phieu_thu_ibfk_1`
    FOREIGN KEY (`MaHoaDon`)
    REFERENCES `bookstoremanagement`.`hoa_don` (`MaHoaDon`),
  CONSTRAINT `phieu_thu_ibfk_2`
    FOREIGN KEY (`MaNhanVien`)
    REFERENCES `bookstoremanagement`.`nhan_vien` (`MaNhanVien`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`quan_ly`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`quan_ly` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`quan_ly` (
  `MaNhanVien` INT NOT NULL,
  `CapBac` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`MaNhanVien`),
  CONSTRAINT `quan_ly_ibfk_1`
    FOREIGN KEY (`MaNhanVien`)
    REFERENCES `bookstoremanagement`.`nhan_vien` (`MaNhanVien`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`tac_gia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`tac_gia` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`tac_gia` (
  `MaTacGia` INT NOT NULL AUTO_INCREMENT,
  `TenTacGia` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`MaTacGia`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`sach_tacgia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`sach_tacgia` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`sach_tacgia` (
  `ISBN` VARCHAR(20) NOT NULL,
  `MaTacGia` INT NOT NULL,
  PRIMARY KEY (`ISBN`, `MaTacGia`),
  INDEX `MaTacGia` (`MaTacGia` ASC) VISIBLE,
  CONSTRAINT `sach_tacgia_ibfk_1`
    FOREIGN KEY (`ISBN`)
    REFERENCES `bookstoremanagement`.`sach` (`ISBN`),
  CONSTRAINT `sach_tacgia_ibfk_2`
    FOREIGN KEY (`MaTacGia`)
    REFERENCES `bookstoremanagement`.`tac_gia` (`MaTacGia`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`the_loai`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`the_loai` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`the_loai` (
  `MaTheLoai` INT NOT NULL AUTO_INCREMENT,
  `TenTheLoai` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`MaTheLoai`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`sach_theloai`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`sach_theloai` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`sach_theloai` (
  `ISBN` VARCHAR(20) NOT NULL,
  `MaTheLoai` INT NOT NULL,
  PRIMARY KEY (`ISBN`, `MaTheLoai`),
  INDEX `MaTheLoai` (`MaTheLoai` ASC) VISIBLE,
  CONSTRAINT `sach_theloai_ibfk_1`
    FOREIGN KEY (`ISBN`)
    REFERENCES `bookstoremanagement`.`sach` (`ISBN`),
  CONSTRAINT `sach_theloai_ibfk_2`
    FOREIGN KEY (`MaTheLoai`)
    REFERENCES `bookstoremanagement`.`the_loai` (`MaTheLoai`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`tham_so`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`tham_so` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`tham_so` (
  `TenThamSo` VARCHAR(100) NOT NULL,
  `GiaTri` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`TenThamSo`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`thu_kho`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`thu_kho` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`thu_kho` (
  `MaNhanVien` INT NOT NULL,
  PRIMARY KEY (`MaNhanVien`),
  CONSTRAINT `thu_kho_ibfk_1`
    FOREIGN KEY (`MaNhanVien`)
    REFERENCES `bookstoremanagement`.`nhan_vien` (`MaNhanVien`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `bookstoremanagement`.`thu_ngan`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `bookstoremanagement`.`thu_ngan` ;

CREATE TABLE IF NOT EXISTS `bookstoremanagement`.`thu_ngan` (
  `MaNhanVien` INT NOT NULL,
  PRIMARY KEY (`MaNhanVien`),
  CONSTRAINT `thu_ngan_ibfk_1`
    FOREIGN KEY (`MaNhanVien`)
    REFERENCES `bookstoremanagement`.`nhan_vien` (`MaNhanVien`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;

USE `bansach`;

DELIMITER $$

USE `bansach`$$
DROP TRIGGER IF EXISTS `bansach`.`after_insert_chitiethoadon` $$
USE `bansach`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `bansach`.`after_insert_chitiethoadon`
AFTER INSERT ON `bansach`.`chitiethoadon`
FOR EACH ROW
BEGIN
    UPDATE Sach 
    SET SoLuongTon = SoLuongTon - NEW.SoLuongBan
    WHERE MaSach = NEW.MaSach;
END$$


USE `bansach`$$
DROP TRIGGER IF EXISTS `bansach`.`after_insert_chitietphieunhap` $$
USE `bansach`$$
CREATE
DEFINER=`root`@`localhost`
TRIGGER `bansach`.`after_insert_chitietphieunhap`
AFTER INSERT ON `bansach`.`chitietphieunhap`
FOR EACH ROW
BEGIN
    UPDATE Sach 
    SET SoLuongTon = SoLuongTon + NEW.SoLuongNhap
    WHERE MaSach = NEW.MaSach;
END$$


DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;ad
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;


USE `bansach`;

-- 1. Thêm Thể loại
INSERT INTO `theloai` (`TenTheLoai`) VALUES 
('Tiểu thuyết'),
('Kinh tế'),
('Công nghệ thông tin'),
('Tâm lý - Kỹ năng sống'),
('Truyện tranh');

-- 2. Thêm Tác giả
INSERT INTO `tacgia` (`TenTacGia`) VALUES 
('Nguyễn Nhật Ánh'),
('J.K. Rowling'),
('Philip Kotler'),
('Robert C. Martin'),
('Dale Carnegie');

-- 3. Thêm Nhà xuất bản
INSERT INTO `nhaxuatban` (`TenNXB`, `DiaChi`, `SoDienThoai`) VALUES 
('NXB Trẻ', '161B Lý Chính Thắng, Q.3, TP.HCM', '02839316289'),
('NXB Kim Đồng', '55 Quang Trung, Hà Nội', '02439434730'),
('NXB Lao Động', '175 Giảng Võ, Hà Nội', '02438515380');

-- 4. Thêm Nhân viên (Mật khẩu để minh họa, thực tế nên mã hóa)
INSERT INTO `nhanvien` (`TenDangNhap`, `MatKhau`, `HoTen`, `VaiTro`, `TrangThai`) VALUES 
('admin', '123456', 'Nguyễn Văn Quản Lý', 'QUAN_LY', 1),
('thukho01', '123456', 'Trần Thị Kho', 'THU_KHO', 1),
('thungan01', '123456', 'Lê Văn Thu Ngân', 'THU_NGAN', 1);

-- 5. Thêm Khách hàng
INSERT INTO `khachhang` (`TenKH`, `SoDienThoai`, `Email`, `DiemTichLuy`) VALUES 
('Phạm Minh Tuấn', '0909123456', 'tuan.pham@email.com', 10),
('Trần Thu Hà', '0918123789', 'ha.tran@email.com', 50),
('Khách vãng lai', NULL, NULL, 0);

-- 6. Thêm Quy định
INSERT INTO `quydinh` (`TenQuyDinh`, `GiaTri`, `MoTa`) VALUES 
('SoLuongNhapToiThieu', '10', 'Số lượng nhập ít nhất cho mỗi đầu sách'),
('TonKhoToiThieu', '20', 'Mức tồn kho báo động cần nhập thêm');

-- 7. Thêm Sách
-- Giả sử ID tự tăng: 1: Mắt Biếc, 2: Harry Potter, 3: Marketing, 4: Clean Code, 5: Đắc Nhân Tâm
INSERT INTO `sach` (`ISBN`, `TenSach`, `MaTheLoai`, `MaNXB`, `GiaNhap`, `GiaBanLe`, `SoLuongTon`, `MoTa`) VALUES 
('978604105', 'Mắt Biếc', 1, 1, 70000, 110000, 0, 'Tiểu thuyết lãng mạn của Nguyễn Nhật Ánh'),
('978054501', 'Harry Potter và Hòn đá phù thủy', 1, 1, 150000, 250000, 0, 'Tập 1 bộ truyện Harry Potter'),
('978013214', 'Clean Code', 3, 3, 400000, 600000, 0, 'Sách gối đầu giường cho lập trình viên'),
('978123456', 'Đắc Nhân Tâm', 4, 3, 50000, 86000, 0, 'Nghệ thuật thu phục lòng người');

-- 8. Liên kết Sách và Tác giả
INSERT INTO `sach_tacgia` (`MaSach`, `MaTacGia`) VALUES 
(1, 1), -- Mắt Biếc - Nguyễn Nhật Ánh
(2, 2), -- Harry Potter - JK Rowling
(3, 4), -- Clean Code - Robert C. Martin
(4, 5); -- Đắc Nhân Tâm - Dale Carnegie

-- 9. Tạo Phiếu nhập sách
INSERT INTO `phieunhapsach` (`MaNV`, `TongTienNhap`) VALUES 
(2, 17500000); -- Nhân viên Thủ kho nhập

-- 10. Tạo Chi tiết phiếu nhập
-- Nhập 100 cuốn Mắt Biếc, 50 cuốn Harry Potter, 20 cuốn Clean Code
INSERT INTO `chitietphieunhap` (`MaPhieuNhap`, `MaSach`, `SoLuongNhap`, `GiaNhap`) VALUES 
(1, 1, 100, 70000),   -- 100 * 70k = 7tr
(1, 2, 50, 150000),  -- 50 * 150k = 7.5tr
(1, 3, 20, 150000);  -- (Giá nhập sai lệch chút để test)

-- 11. Tạo Hóa đơn bán sách
INSERT INTO `hoadonbansach` (`MaNV`, `MaKH`, `TongTien`, `TienGiamGia`) VALUES 
(3, 1, 360000, 10000); -- Nhân viên Thu ngân bán cho Khách ID 1

-- 12. Tạo Chi tiết hóa đơn
-- Khách mua 1 cuốn Mắt Biếc và 1 cuốn Harry Potter
INSERT INTO `chitiethoadon` (`MaHoaDon`, `MaSach`, `SoLuongBan`, `GiaBan`) VALUES 
(1, 1, 1, 110000),
(1, 2, 1, 250000);

-- 13. Tạo Phiếu thu tiền (Thanh toán cho hóa đơn trên)
INSERT INTO `phieuthutien` (`MaHoaDon`, `SoTienThu`, `PhuongThucThanhToan`) VALUES 
(1, 350000, 'TIEN_MAT');


