-- Update book cover images with real URLs from Fahasa
-- Run this script in MySQL to add images to existing books

USE bansach;

-- Mắt Biếc - Nguyễn Nhật Ánh
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935235228276.jpg' 
WHERE MaSach = 1;

-- Harry Potter và Hòn đá phù thủy
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/h/a/harry-potter-va-hon-da-phu-thuy.jpg' 
WHERE MaSach = 2;

-- Clean Code
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935251407761.jpg' 
WHERE MaSach = 3;

-- Đắc Nhân Tâm
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935086840542.jpg' 
WHERE MaSach = 4;

-- Verify updates
SELECT MaSach, TenSach, LEFT(HinhAnh, 50) as HinhAnh_Preview FROM sach;
