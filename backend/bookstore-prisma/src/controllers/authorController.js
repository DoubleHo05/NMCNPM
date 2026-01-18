const prisma = require('../config/database');

// Get all authors
const getAllAuthors = async (req, res) => {
    try {
        const authors = await prisma.tacGia.findMany({
            orderBy: { tenTacGia: 'asc' },
            include: {
                _count: {
                    select: { sach: true }
                }
            }
        });

        res.json({
            success: true,
            data: authors.map(a => ({
                id: a.maTacGia,
                name: a.tenTacGia,
                bookCount: a._count.sach
            }))
        });
    } catch (error) {
        console.error('Error getting authors:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách tác giả' });
    }
};

// Create author
const createAuthor = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Tên tác giả là bắt buộc' });
        }

        const author = await prisma.tacGia.create({
            data: { tenTacGia: name }
        });

        res.status(201).json({
            success: true,
            message: 'Tạo tác giả thành công',
            data: {
                id: author.maTacGia,
                name: author.tenTacGia
            }
        });
    } catch (error) {
        console.error('Error creating author:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo tác giả' });
    }
};

// Update author
const updateAuthor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const author = await prisma.tacGia.update({
            where: { maTacGia: parseInt(id) },
            data: { tenTacGia: name }
        });

        res.json({
            success: true,
            message: 'Cập nhật tác giả thành công',
            data: {
                id: author.maTacGia,
                name: author.tenTacGia
            }
        });
    } catch (error) {
        console.error('Error updating author:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật tác giả' });
    }
};

// Delete author
const deleteAuthor = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if author has books
        const bookCount = await prisma.sachTacGia.count({
            where: { maTacGia: parseInt(id) }
        });

        if (bookCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa tác giả này vì có ${bookCount} sách liên quan`
            });
        }

        await prisma.tacGia.delete({
            where: { maTacGia: parseInt(id) }
        });

        res.json({ success: true, message: 'Xóa tác giả thành công' });
    } catch (error) {
        console.error('Error deleting author:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa tác giả' });
    }
};

module.exports = {
    getAllAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor
};
