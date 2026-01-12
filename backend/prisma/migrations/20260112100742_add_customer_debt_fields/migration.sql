/*
  Warnings:

  - You are about to drop the column `NgayBan` on the `hoadonbansach` table. All the data in the column will be lost.
  - Added the required column `MaKH` to the `phieuthutien` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `phieuthutien` DROP FOREIGN KEY `phieuthutien_MaHoaDon_fkey`;

-- DropIndex
DROP INDEX `phieuthutien_MaHoaDon_fkey` ON `phieuthutien`;

-- AlterTable
ALTER TABLE `hoadonbansach` DROP COLUMN `NgayBan`,
    ADD COLUMN `NgayLap` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `TrangThai` VARCHAR(30) NULL DEFAULT 'CHUA_THANH_TOAN';

-- AlterTable
ALTER TABLE `khachhang` ADD COLUMN `CongNo` DECIMAL(15, 2) NULL DEFAULT 0.00,
    ADD COLUMN `DiaChi` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `phieuthutien` ADD COLUMN `GhiChu` VARCHAR(500) NULL,
    ADD COLUMN `MaKH` INTEGER NOT NULL,
    ADD COLUMN `MaNV` INTEGER NULL,
    ADD COLUMN `TrangThai` VARCHAR(20) NULL DEFAULT 'ACTIVE',
    MODIFY `MaHoaDon` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `phieuthutien` ADD CONSTRAINT `phieuthutien_MaKH_fkey` FOREIGN KEY (`MaKH`) REFERENCES `khachhang`(`MaKH`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieuthutien` ADD CONSTRAINT `phieuthutien_MaHoaDon_fkey` FOREIGN KEY (`MaHoaDon`) REFERENCES `hoadonbansach`(`MaHoaDon`) ON DELETE SET NULL ON UPDATE CASCADE;
