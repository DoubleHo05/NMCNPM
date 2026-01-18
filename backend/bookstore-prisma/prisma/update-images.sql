-- Update remaining books with manual image URLs
SET NAMES utf8mb4;

-- Vietnamese books - using Fahasa CDN (reliable)
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/m/a/mat-biec_bia-mem_1_2019_12_20_10_03_14.jpg' WHERE MaSach = 1;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/t/o/toi_thay_hoa_vang_tren_co_xanh_tb_2019.jpg' WHERE MaSach = 2;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/c/h/cho-toi-xin-mot-ve-di-tuoi-tho.jpg' WHERE MaSach = 3;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/c/a/canh_dong_bat_tan_2.jpg' WHERE MaSach = 4;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/n/h/nha-gia-kim-tai-ban-2020.jpg' WHERE MaSach = 6;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/t/u/tuoi_tre_dang_gia_bao_nhieu_-_bia_cung_1_2019_06_14_14_47_47.jpg' WHERE MaSach = 7;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/d/o/doi-ngan-dung-ngu-dai.jpg' WHERE MaSach = 8;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/d/e/de-men-phieu-luu-ky-b-c.jpg' WHERE MaSach = 9;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/c/h/cha-giau-cha-ngheo.jpg' WHERE MaSach = 13;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/n/h/nhat-ky-dang-thuy-tram.jpg' WHERE MaSach = 19;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/t/h/thep-da-toi-the-day.jpg' WHERE MaSach = 22;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/d/o/doc-vi-bat-ky-ai.jpg' WHERE MaSach = 23;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/k/h/khong-gia-dinh.jpg' WHERE MaSach = 24;
UPDATE sach SET HinhAnh = 'https://cdn0.fahasa.com/media/catalog/product/h/o/hoang-tu-be.jpg' WHERE MaSach = 26;

SELECT MaSach, TenSach, IF(HinhAnh LIKE '/uploads%', 'LOCAL', 'URL') as ImageType FROM sach;
