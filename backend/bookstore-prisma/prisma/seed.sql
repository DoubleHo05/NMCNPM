-- =============================================
-- SEED DATA: Nha sach voi sach Viet Nam thuc te
-- 6 thang du lieu ban hang
-- =============================================

-- Set UTF-8 encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Xoa du lieu cu (theo thu tu foreign key)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE phieuthutien;
TRUNCATE TABLE chitiethoadon;
TRUNCATE TABLE hoadonbansach;
TRUNCATE TABLE chitietphieunhap;
TRUNCATE TABLE phieunhapsach;
TRUNCATE TABLE sach_tacgia;
TRUNCATE TABLE sach;
TRUNCATE TABLE tacgia;
TRUNCATE TABLE theloai;
TRUNCATE TABLE nhaxuatban;
TRUNCATE TABLE khachhang;
SET FOREIGN_KEY_CHECKS = 1;

-- =============================================
-- THỂ LOẠI
-- =============================================
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

-- =============================================
-- NHÀ XUẤT BẢN
-- =============================================
INSERT INTO nhaxuatban (TenNXB, DiaChi, SoDienThoai) VALUES
('NXB Trẻ', '161B Lý Chính Thắng, Q.3, TP.HCM', '028-39316289'),
('NXB Kim Đồng', '55 Quang Trung, Hà Nội', '024-39434730'),
('NXB Tổng hợp TP.HCM', '62 Nguyễn Thị Minh Khai, Q.1', '028-38256804'),
('NXB Văn học', '18 Nguyễn Trường Tộ, Hà Nội', '024-37161518'),
('NXB Hội Nhà văn', '65 Nguyễn Du, Hà Nội', '024-38222135'),
('NXB Lao động', '175 Giảng Võ, Hà Nội', '024-38515380'),
('NXB Thế giới', '46 Trần Hưng Đạo, Hà Nội', '024-38253841'),
('NXB Phụ nữ', '39 Hàng Chuối, Hà Nội', '024-39717979');

-- =============================================
-- TÁC GIẢ
-- =============================================
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

-- =============================================
-- SÁCH (30 cuốn sách thực tế từ Fahasa)
-- =============================================
INSERT INTO sach (ISBN, TenSach, MaTheLoai, MaNXB, GiaNhap, GiaBanLe, SoLuongTon, TonKhoToiThieu, MoTa, HinhAnh, SoTrang, TrongLuong, KichThuoc, NamXuatBan) VALUES
('9786041234567', 'Mắt Biếc', 1, 1, 85000, 110000, 45, 10, 'Truyện dài lãng mạn của nhà văn Nguyễn Nhật Ánh. Câu chuyện tình yêu đơn phương đầy cảm xúc.', '/uploads/books/book_1.jpg', 296, 250, '13x20.5 cm', 2019),
('9786041234568', 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 1, 1, 95000, 125000, 38, 10, 'Câu chuyện về tuổi thơ miền quê trong trẻo, đã được chuyển thể thành phim điện ảnh.', '/uploads/books/book_2.jpg', 378, 380, '14.5x20.5 cm', 2018),
('9786041234569', 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', 1, 1, 72000, 95000, 52, 10, 'Tự truyện về tuổi thơ của nhà văn, hài hước và cảm động.', '/uploads/books/book_3.jpg', 218, 230, '13x20.5 cm', 2018),
('9786041234570', 'Cánh Đồng Bất Tận', 1, 1, 65000, 85000, 28, 10, 'Truyện ngắn xuất sắc về cuộc sống miền Tây sông nước, đoạt nhiều giải thưởng.', '/uploads/books/book_4.jpg', 224, 220, '13x20.5 cm', 2017),
('9786041234571', 'Đắc Nhân Tâm', 4, 3, 68000, 88000, 120, 15, 'Nghệ thuật thu phục lòng người. Cuốn sách self-help bán chạy nhất mọi thời đại.', '/uploads/books/book_5.jpg', 320, 300, '14.5x20.5 cm', 2016),
('9786041234572', 'Nhà Giả Kim', 2, 4, 60000, 79000, 85, 10, 'Tiểu thuyết về hành trình theo đuổi ước mơ của cậu bé chăn cừu Santiago.', '/uploads/books/book_6.jpg', 228, 220, '13x20.5 cm', 2020),
('9786041234573', 'Tuổi Trẻ Đáng Giá Bao Nhiêu', 4, 5, 70000, 90000, 67, 10, 'Sách self-help dành cho người trẻ, truyền cảm hứng sống tích cực.', '/uploads/books/book_7.jpg', 285, 280, '13x20.5 cm', 2017),
('9786041234574', 'Đời Ngắn Đừng Ngủ Dài', 4, 3, 75000, 99000, 43, 10, 'Triết lý sống tích cực từ tác giả best-seller Robin Sharma.', '/uploads/books/book_8.jpg', 168, 180, '12x20 cm', 2019),
('9786041234575', 'Dế Mèn Phiêu Lưu Ký', 6, 2, 35000, 45000, 95, 15, 'Truyện thiếu nhi kinh điển Việt Nam, tác phẩm nổi tiếng nhất của nhà văn Tô Hoài.', '/uploads/books/book_9.jpg', 192, 200, '14.5x20.5 cm', 2020),
('9786041234576', 'Chí Phèo', 1, 4, 30000, 39000, 78, 10, 'Truyện ngắn hiện thực phê phán nổi tiếng, bi kịch của người nông dân bị tha hóa.', '/uploads/books/book_10.jpg', 80, 100, '13x19 cm', 2018),
('9786041234577', 'Số Đỏ', 1, 4, 58000, 75000, 55, 10, 'Tiểu thuyết trào phúng đỉnh cao, châm biếm xã hội Việt Nam những năm 1930.', '/uploads/books/book_11.jpg', 320, 350, '14.5x20.5 cm', 2017),
('9786041234578', 'Tắt Đèn', 1, 4, 42000, 55000, 62, 10, 'Tiểu thuyết về cuộc sống cực khổ của người nông dân dưới ách thực dân phong kiến.', '/uploads/books/book_12.jpg', 256, 280, '14.5x20.5 cm', 2019),
('9786041234579', 'Cha Giàu Cha Nghèo', 3, 3, 108000, 140000, 75, 15, 'Sách về tài chính cá nhân, hướng dẫn tư duy tài chính thông minh.', '/uploads/books/book_13.jpg', 368, 400, '15.5x23 cm', 2020),
('9786041234580', 'Nghĩ Giàu Làm Giàu', 3, 6, 85000, 110000, 48, 10, 'Triết lý thành công từ nghiên cứu 500 người giàu nhất nước Mỹ.', '/uploads/books/book_14.jpg', 352, 380, '14.5x20.5 cm', 2019),
('9786041234581', 'Bản Đồ Tư Duy', 8, 1, 96000, 125000, 35, 10, 'Phương pháp tư duy sáng tạo Mind Map nổi tiếng thế giới.', '/uploads/books/book_15.jpg', 280, 320, '15.5x23 cm', 2018),
('9786041234582', 'Ngày Xưa Có Một Chuyện Tình', 1, 1, 88000, 115000, 42, 10, 'Truyện tình cảm lãng mạn về tình yêu tuổi học trò.', '/uploads/books/book_16.jpg', 285, 280, '13x20.5 cm', 2016),
('9786041234583', 'Lược Sử Thời Gian', 8, 7, 115000, 150000, 25, 10, 'Khám phá vũ trụ và thời gian qua góc nhìn của nhà vật lý thiên tài.', '/uploads/books/book_17.jpg', 280, 320, '14.5x20.5 cm', 2017),
('9786041234584', 'Sapiens: Lược Sử Loài Người', 9, 7, 145000, 189000, 32, 10, 'Lịch sử tiến hóa của loài người từ thời tiền sử đến hiện đại.', '/uploads/books/book_18.jpg', 560, 550, '15.5x23 cm', 2019),
('9786041234585', 'Nhật Ký Đặng Thùy Trâm', 9, 5, 65000, 85000, 28, 10, 'Nhật ký thời chiến cảm động của nữ bác sĩ anh hùng.', '/uploads/books/book_19.jpg', 320, 280, '14x21 cm', 2015),
('9786041234586', 'Doraemon Tập 1', 10, 2, 19000, 25000, 150, 20, 'Truyện tranh Nhật Bản nổi tiếng về chú mèo máy đến từ tương lai.', '/uploads/books/book_20.jpg', 48, 80, '11.5x17.5 cm', 2020),
('9786041234587', 'Conan Tập 1', 10, 2, 19000, 25000, 130, 20, 'Truyện tranh thám tử nổi tiếng, hành trình của thám tử nhí Conan.', '/uploads/books/book_21.jpg', 52, 85, '11.5x17.5 cm', 2020),
('9786041234588', 'Thép Đã Tôi Thế Đấy', 2, 4, 68000, 89000, 38, 10, 'Tiểu thuyết Liên Xô kinh điển về ý chí và nghị lực sống.', '/uploads/books/book_22.jpg', 544, 480, '14.5x20.5 cm', 2018),
('9786041234589', 'Đọc Vị Bất Kỳ Ai', 5, 6, 75000, 98000, 55, 10, 'Tâm lý học ứng dụng, cách đọc suy nghĩ người khác.', '/uploads/books/book_23.jpg', 208, 220, '13x20.5 cm', 2019),
('9786041234590', 'Không Gia Đình', 2, 2, 58000, 75000, 45, 10, 'Truyện thiếu nhi cổ điển Pháp về cậu bé Rémi đi tìm gia đình.', '/uploads/books/book_24.jpg', 416, 400, '14.5x20.5 cm', 2017),
('9786041234591', 'Harry Potter Và Hòn Đá Phù Thủy', 2, 1, 112000, 145000, 68, 15, 'Tiểu thuyết fantasy nổi tiếng, khởi đầu hành trình của cậu bé phù thủy.', '/uploads/books/book_25.jpg', 366, 380, '14.5x20.5 cm', 2020),
('9786041234592', 'Hoàng Tử Bé', 2, 5, 50000, 65000, 88, 10, 'Truyện ngụ ngôn triết học về tình bạn và ý nghĩa cuộc sống.', '/uploads/books/book_26.jpg', 128, 150, '14x21 cm', 2019),
('9786041234593', 'Muôn Kiếp Nhân Sinh', 5, 3, 145000, 188000, 52, 10, 'Sách về tâm linh và nhân sinh, best-seller nhiều năm liền.', '/uploads/books/book_27.jpg', 504, 500, '15.5x23 cm', 2020),
('9786041234594', 'Bí Mật Tư Duy Triệu Phú', 3, 1, 92000, 120000, 42, 10, 'Tư duy làm giàu, thay đổi mindset về tiền bạc.', '/uploads/books/book_28.jpg', 320, 350, '14.5x20.5 cm', 2018),
('9786041234595', 'Người Giàu Nhất Thành Babylon', 3, 3, 65000, 85000, 65, 10, 'Bí quyết tài chính cổ điển qua những câu chuyện cổ xưa.', '/uploads/books/book_29.jpg', 256, 280, '14.5x20.5 cm', 2017),
('9786041234596', 'Hạt Giống Tâm Hồn', 4, 3, 73000, 95000, 78, 10, 'Những câu chuyện truyền cảm hứng, sưu tầm từ khắp nơi trên thế giới.', '/uploads/books/book_30.jpg', 288, 300, '13x20.5 cm', 2019);

-- =============================================
-- LIÊN KẾT SÁCH - TÁC GIẢ
-- =============================================
INSERT INTO sach_tacgia (MaSach, MaTacGia) VALUES
(1, 1), (2, 1), (3, 1), (4, 2), (5, 3), (6, 4), (7, 5), (8, 6),
(9, 9), (10, 10), (11, 11), (12, 12), (13, 13), (14, 14), (15, 15),
(16, 1), (17, 15), (18, 15), (19, 10), (20, 9), (21, 9), (22, 10),
(23, 14), (24, 10), (25, 3), (26, 4), (27, 7), (28, 6), (29, 14), (30, 5);

-- =============================================
-- KHÁCH HÀNG (20 khách)
-- =============================================
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

-- =============================================
-- HÓA ĐƠN BÁN SÁCH (6 tháng, ~180 đơn)
-- Sẽ được tạo bằng stored procedure
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
    
    -- Tháng 1 đến 6 (6 tháng gần nhất)
    SET monthOffset = 5;
    
    WHILE monthOffset >= 0 DO
        -- 25-40 đơn mỗi tháng
        SET ordersPerMonth = 25 + FLOOR(RAND() * 15);
        SET i = 0;
        
        WHILE i < ordersPerMonth DO
            -- Ngày random trong tháng
            SET orderDate = DATE_SUB(CURDATE(), INTERVAL monthOffset MONTH);
            SET orderDate = DATE_ADD(DATE_FORMAT(orderDate, '%Y-%m-01'), INTERVAL FLOOR(RAND() * 27) DAY);
            
            -- Random nhân viên (1-5)
            SET randomNV = 1 + FLOOR(RAND() * 5);
            -- Random khách hàng (1-20, hoặc NULL)
            SET randomKH = IF(RAND() > 0.2, 1 + FLOOR(RAND() * 20), NULL);
            
            -- Tạo hóa đơn
            INSERT INTO hoadonbansach (MaNV, MaKH, NgayBan, TongTien, TienGiamGia, ThanhTien)
            VALUES (randomNV, randomKH, orderDate, 0, 0, 0);
            
            SET lastOrderId = LAST_INSERT_ID();
            SET orderTotal = 0;
            
            -- 1-4 sản phẩm mỗi đơn
            SET j = 1 + FLOOR(RAND() * 4);
            
            WHILE j > 0 DO
                -- Random sách (1-30)
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
            
            -- Cập nhật tổng tiền hóa đơn
            UPDATE hoadonbansach SET TongTien = orderTotal, ThanhTien = orderTotal WHERE MaHoaDon = lastOrderId;
            
            -- Tạo phiếu thu
            INSERT INTO phieuthutien (MaHoaDon, SoTienThu, NgayThu, PhuongThucThanhToan)
            VALUES (lastOrderId, orderTotal, orderDate, ELT(1 + FLOOR(RAND() * 3), 'TIEN_MAT', 'THE_NGAN_HANG', 'VI_DIEN_TU'));
            
            SET i = i + 1;
        END WHILE;
        
        SET monthOffset = monthOffset - 1;
    END WHILE;
END//

DELIMITER ;

-- Chạy procedure tạo dữ liệu
CALL GenerateSalesData();

-- Xóa procedure sau khi dùng
DROP PROCEDURE IF EXISTS GenerateSalesData;

-- =============================================
-- KIỂM TRA KẾT QUẢ
-- =============================================
SELECT 'Sách' as 'Bảng', COUNT(*) as 'Số dòng' FROM sach
UNION ALL SELECT 'Khách hàng', COUNT(*) FROM khachhang
UNION ALL SELECT 'Hóa đơn', COUNT(*) FROM hoadonbansach
UNION ALL SELECT 'Chi tiết hóa đơn', COUNT(*) FROM chitiethoadon
UNION ALL SELECT 'Phiếu thu', COUNT(*) FROM phieuthutien;

SELECT 
    DATE_FORMAT(NgayBan, '%Y-%m') as Thang,
    COUNT(*) as SoDon,
    FORMAT(SUM(ThanhTien), 0) as DoanhThu
FROM hoadonbansach
GROUP BY DATE_FORMAT(NgayBan, '%Y-%m')
ORDER BY Thang;
