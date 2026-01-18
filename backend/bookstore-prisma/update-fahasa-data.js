const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Real book data inspired by Fahasa
const realBooks = [
    { id: 1, title: 'Mắt Biếc', author: 'Nguyễn Nhật Ánh', publisher: 'NXB Trẻ', price: 110000, desc: 'Truyện dài lãng mạn của nhà văn Nguyễn Nhật Ánh. Câu chuyện tình yêu đơn phương đầy cảm xúc.' },
    { id: 2, title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', author: 'Nguyễn Nhật Ánh', publisher: 'NXB Trẻ', price: 125000, desc: 'Câu chuyện về tuổi thơ miền quê trong trẻo, đã được chuyển thể thành phim điện ảnh.' },
    { id: 3, title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', author: 'Nguyễn Nhật Ánh', publisher: 'NXB Trẻ', price: 95000, desc: 'Tự truyện về tuổi thơ của nhà văn, hài hước và cảm động.' },
    { id: 4, title: 'Cánh Đồng Bất Tận', author: 'Nguyễn Ngọc Tư', publisher: 'NXB Trẻ', price: 85000, desc: 'Truyện ngắn xuất sắc về cuộc sống miền Tây sông nước, đoạt nhiều giải thưởng.' },
    { id: 5, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', publisher: 'NXB Tổng Hợp TP.HCM', price: 88000, desc: 'Nghệ thuật thu phục lòng người. Cuốn sách self-help bán chạy nhất mọi thời đại.' },
    { id: 6, title: 'Nhà Giả Kim', author: 'Paulo Coelho', publisher: 'NXB Văn Học', price: 79000, desc: 'Tiểu thuyết về hành trình theo đuổi ước mơ của cậu bé chăn cừu Santiago.' },
    { id: 7, title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn', publisher: 'NXB Hội Nhà Văn', price: 90000, desc: 'Sách self-help dành cho người trẻ, truyền cảm hứng sống tích cực.' },
    { id: 8, title: 'Đời Ngắn Đừng Ngủ Dài', author: 'Robin Sharma', publisher: 'NXB Trẻ', price: 99000, desc: 'Triết lý sống tích cực từ tác giả best-seller Robin Sharma.' },
    { id: 9, title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài', publisher: 'NXB Kim Đồng', price: 45000, desc: 'Truyện thiếu nhi kinh điển Việt Nam, tác phẩm nổi tiếng nhất của nhà văn Tô Hoài.' },
    { id: 10, title: 'Chí Phèo', author: 'Nam Cao', publisher: 'NXB Văn Học', price: 39000, desc: 'Truyện ngắn hiện thực phê phán nổi tiếng, bi kịch của người nông dân bị tha hóa.' },
    { id: 11, title: 'Số Đỏ', author: 'Vũ Trọng Phụng', publisher: 'NXB Văn Học', price: 75000, desc: 'Tiểu thuyết trào phúng đỉnh cao, châm biếm xã hội Việt Nam những năm 1930.' },
    { id: 12, title: 'Tắt Đèn', author: 'Ngô Tất Tố', publisher: 'NXB Văn Học', price: 55000, desc: 'Tiểu thuyết về cuộc sống cực khổ của người nông dân dưới ách thực dân phong kiến.' },
    { id: 13, title: 'Cha Giàu Cha Nghèo', author: 'Robert Kiyosaki', publisher: 'NXB Trẻ', price: 140000, desc: 'Sách về tài chính cá nhân, hướng dẫn tư duy tài chính thông minh.' },
    { id: 14, title: 'Nghĩ Giàu Làm Giàu', author: 'Napoleon Hill', publisher: 'NXB Tổng Hợp TP.HCM', price: 110000, desc: 'Triết lý thành công từ nghiên cứu 500 người giàu nhất nước Mỹ.' },
    { id: 15, title: 'Bản Đồ Tư Duy', author: 'Tony Buzan', publisher: 'NXB Lao Động', price: 125000, desc: 'Phương pháp tư duy sáng tạo Mind Map nổi tiếng thế giới.' },
    { id: 16, title: 'Ngày Xưa Có Một Chuyện Tình', author: 'Nguyễn Nhật Ánh', publisher: 'NXB Trẻ', price: 115000, desc: 'Truyện tình cảm lãng mạn về tình yêu tuổi học trò.' },
    { id: 17, title: 'Lược Sử Thời Gian', author: 'Stephen Hawking', publisher: 'NXB Trẻ', price: 150000, desc: 'Khám phá vũ trụ và thời gian qua góc nhìn của nhà vật lý thiên tài.' },
    { id: 18, title: 'Sapiens: Lược Sử Loài Người', author: 'Yuval Noah Harari', publisher: 'NXB Thế Giới', price: 189000, desc: 'Lịch sử tiến hóa của loài người từ thời tiền sử đến hiện đại.' },
    { id: 19, title: 'Nhật Ký Đặng Thùy Trâm', author: 'Đặng Thùy Trâm', publisher: 'NXB Hội Nhà Văn', price: 85000, desc: 'Nhật ký thời chiến cảm động của nữ bác sĩ anh hùng.' },
    { id: 20, title: 'Doraemon Tập 1', author: 'Fujiko F. Fujio', publisher: 'NXB Kim Đồng', price: 25000, desc: 'Truyện tranh Nhật Bản nổi tiếng về chú mèo máy đến từ tương lai.' },
    { id: 21, title: 'Conan Tập 1', author: 'Gosho Aoyama', publisher: 'NXB Kim Đồng', price: 25000, desc: 'Truyện tranh thám tử nổi tiếng, hành trình của thám tử nhí Conan.' },
    { id: 22, title: 'Thép Đã Tôi Thế Đấy', author: 'Nikolai Ostrovsky', publisher: 'NXB Văn Học', price: 89000, desc: 'Tiểu thuyết Liên Xô kinh điển về ý chí và nghị lực sống.' },
    { id: 23, title: 'Đọc Vị Bất Kỳ Ai', author: 'David J. Lieberman', publisher: 'NXB Lao Động', price: 98000, desc: 'Tâm lý học ứng dụng, cách đọc suy nghĩ người khác.' },
    { id: 24, title: 'Không Gia Đình', author: 'Hector Malot', publisher: 'NXB Kim Đồng', price: 75000, desc: 'Truyện thiếu nhi cổ điển Pháp về cậu bé Rémi đi tìm gia đình.' },
    { id: 25, title: 'Harry Potter Và Hòn Đá Phù Thủy', author: 'J.K. Rowling', publisher: 'NXB Trẻ', price: 145000, desc: 'Tiểu thuyết fantasy nổi tiếng, khởi đầu hành trình của cậu bé phù thủy.' },
    { id: 26, title: 'Hoàng Tử Bé', author: 'Antoine de Saint-Exupéry', publisher: 'NXB Hội Nhà Văn', price: 65000, desc: 'Truyện ngụ ngôn triết học về tình bạn và ý nghĩa cuộc sống.' },
    { id: 27, title: 'Muôn Kiếp Nhân Sinh', author: 'Nguyên Phong', publisher: 'NXB Tổng Hợp TP.HCM', price: 188000, desc: 'Sách về tâm linh và nhân sinh, best-seller nhiều năm liền.' },
    { id: 28, title: 'Bí Mật Tư Duy Triệu Phú', author: 'T. Harv Eker', publisher: 'NXB Trẻ', price: 120000, desc: 'Tư duy làm giàu, thay đổi mindset về tiền bạc.' },
    { id: 29, title: 'Người Giàu Nhất Thành Babylon', author: 'George S. Clason', publisher: 'NXB Tổng Hợp TP.HCM', price: 85000, desc: 'Bí quyết tài chính cổ điển qua những câu chuyện cổ xưa.' },
    { id: 30, title: 'Hạt Giống Tâm Hồn', author: 'Nhiều tác giả', publisher: 'NXB Tổng Hợp TP.HCM', price: 95000, desc: 'Những câu chuyện truyền cảm hứng, sưu tầm từ khắp nơi trên thế giới.' }
];

async function updateBooks() {
    console.log('📚 Updating books with Fahasa-style data...\n');

    // Get existing publishers
    const publishers = await prisma.nhaXuatBan.findMany();
    const pubMap = {};
    publishers.forEach(p => pubMap[p.tenNXB] = p.maNXB);

    // Update each book
    for (const book of realBooks) {
        // Find matching publisher or use first one
        let pubId = 1;
        for (const [name, id] of Object.entries(pubMap)) {
            if (book.publisher.includes(name.substring(0, 10))) {
                pubId = id;
                break;
            }
        }

        await prisma.sach.update({
            where: { maSach: book.id },
            data: {
                tenSach: book.title,
                moTa: book.desc,
                giaBanLe: book.price,
                maNXB: pubId
            }
        });
        console.log(`✅ ${book.id}. ${book.title} - ${book.price.toLocaleString()}đ`);
    }

    console.log('\n🎉 Done! All 30 books updated with realistic Fahasa data');
}

updateBooks()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
    });
