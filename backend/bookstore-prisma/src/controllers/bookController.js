const prisma = require('../config/database');

// Lấy danh sách tất cả sách
const getAllBooks = async (req, res) => {
    try {
        const books = await prisma.sach.findMany({
            include: {
                theLoai: true,
                nhaXuatBan: true,
                tacGia: {
                    include: {
                        tacGia: true
                    }
                }
            }
        });

        // Format data to match frontend expectation
        const formattedBooks = books.map(book => ({
            id: String(book.maSach), // Frontend expects string ID
            // Optional: Format as B001 etc if needed, but plain string number is safer for now
            // id: `B${String(book.maSach).padStart(3, '0')}`,
            title: book.tenSach,
            author: book.tacGia.map(t => t.tacGia.tenTacGia).join(', '),
            category: book.theLoai?.tenTheLoai || '',
            publisher: book.nhaXuatBan?.tenNXB || '',
            publishYear: 2024,
            price: Number(book.giaBanLe),
            stock: book.soLuongTon,
            imageUrl: book.hinhAnh || '',
            description: book.moTa || '',
        }));

        res.status(200).json({
            success: true,
            data: formattedBooks, // Return raw or formatted? Let's return raw + formatted or handle in FE
            // Let's stick to returning raw-ish structure but properly populated
            books: books
        });
    } catch (error) {
        console.error('Get all books error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách sách'
        });
    }
};

// Cập nhật thông tin sách
const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Map frontend fields to backend
        const updateData = { ...data };
        if (data.description !== undefined) updateData.moTa = data.description;
        if (data.imageUrl !== undefined) updateData.hinhAnh = data.imageUrl;
        delete updateData.description; // Remove frontend-only keys if strict
        delete updateData.imageUrl;

        const updatedBook = await prisma.sach.update({
            where: { maSach: parseInt(id) },
            data: updateData
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật thành công',
            data: updatedBook
        });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sách'
        });
    }
};

// Xóa sách
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        // Check constraints (e.g. valid invoices)

        await prisma.sach.delete({
            where: { maSach: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Xóa sách thành công'
        });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({
            success: false,
            message: 'Không thể xóa sách (có thể đang có dữ liệu liên quan)'
        });
    }
};

module.exports = {
    getAllBooks,
    updateBook,
    deleteBook
};
