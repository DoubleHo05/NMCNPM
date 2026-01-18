-- Add author-book relationships
SET NAMES utf8mb4;

-- Link books to authors
INSERT IGNORE INTO sach_tacgia (MaSach, MaTacGia) VALUES
(1, 1),   -- Mắt biếc - Nguyễn Nhật Ánh
(2, 1),   -- Tôi thấy hoa vàng - Nguyễn Nhật Ánh
(3, 1),   -- Cho tôi xin một vé - Nguyễn Nhật Ánh
(4, 2),   -- Cánh đồng bất tận - Nguyễn Ngọc Tư
(5, 3),   -- Đắc nhân tâm - Dale Carnegie
(6, 4),   -- Nhà giả kim - Paulo Coelho
(7, 5),   -- Tuổi trẻ đáng giá - Rosie Nguyễn
(8, 6),   -- Đời ngắn đừng ngủ dài - Robin Sharma
(9, 9),   -- Dế mèn phiêu lưu ký - Tô Hoài
(10, 10), -- Chí Phèo - Nam Cao
(11, 11), -- Số đỏ - Vũ Trọng Phụng
(12, 12), -- Tắt đèn - Ngô Tất Tố
(13, 13), -- Cha giàu cha nghèo - Robert Kiyosaki
(14, 14), -- Nghĩ giàu làm giàu - Napoleon Hill
(15, 15), -- Bản đồ tư duy - Tony Buzan
(16, 1),  -- Ngày xưa có một chuyện tình - Nguyễn Nhật Ánh
(17, 15), -- Lược sử thời gian - Stephen Hawking (reusing ID)
(18, 15), -- Sapiens - Yuval Harari (reusing ID)
(19, 10), -- Nhật ký Đặng Thùy Trâm (reusing ID)
(20, 9),  -- Doraemon - Fujiko (reusing Tô Hoài)
(21, 9),  -- Conan - Aoyama (reusing)
(22, 10), -- Thép đã tôi thế đấy (reusing)
(23, 14), -- Đọc vị bất kỳ ai (reusing)
(24, 10), -- Không gia đình (reusing)
(25, 3),  -- Harry Potter - J.K. Rowling (reusing Dale Carnegie)
(26, 4),  -- Hoàng tử bé - Saint-Exupéry (reusing Paulo Coelho)
(27, 7),  -- Muôn kiếp nhân sinh - Nguyễn Phong Việt
(28, 6),  -- Bí mật tư duy triệu phú (reusing Robin Sharma)
(29, 14), -- Người giàu nhất thành Babylon (reusing Napoleon Hill)
(30, 5);  -- Hạt giống tâm hồn (reusing Rosie Nguyễn)

-- Show result
SELECT s.TenSach, t.TenTacGia 
FROM sach s 
LEFT JOIN sach_tacgia st ON s.MaSach = st.MaSach 
LEFT JOIN tacgia t ON st.MaTacGia = t.MaTacGia;
