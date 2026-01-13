const prisma = require('../config/database');

// Get all publishers
const getAllPublishers = async (req, res) => {
    try {
        const publishers = await prisma.nhaXuatBan.findMany({
            orderBy: { tenNXB: 'asc' },
            include: {
                _count: {
                    select: { sach: true }
                }
            }
        });

        res.json({
            success: true,
            data: publishers.map(p => ({
                id: p.maNXB,
                name: p.tenNXB,
                address: p.diaChi,
                phone: p.soDienThoai,
                bookCount: p._count.sach
            }))
        });
    } catch (error) {
        console.error('Error getting publishers:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách NXB' });
    }
};

// Create publisher
const createPublisher = async (req, res) => {
    try {
        const { name, address, phone } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Tên NXB là bắt buộc' });
        }

        const publisher = await prisma.nhaXuatBan.create({
            data: {
                tenNXB: name,
                diaChi: address || null,
                soDienThoai: phone || null
            }
        });

        res.status(201).json({
            success: true,
            message: 'Tạo NXB thành công',
            data: {
                id: publisher.maNXB,
                name: publisher.tenNXB,
                address: publisher.diaChi,
                phone: publisher.soDienThoai
            }
        });
    } catch (error) {
        console.error('Error creating publisher:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi tạo NXB' });
    }
};

// Update publisher
const updatePublisher = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, phone } = req.body;

        const publisher = await prisma.nhaXuatBan.update({
            where: { maNXB: parseInt(id) },
            data: {
                tenNXB: name,
                diaChi: address,
                soDienThoai: phone
            }
        });

        res.json({
            success: true,
            message: 'Cập nhật NXB thành công',
            data: {
                id: publisher.maNXB,
                name: publisher.tenNXB,
                address: publisher.diaChi,
                phone: publisher.soDienThoai
            }
        });
    } catch (error) {
        console.error('Error updating publisher:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật NXB' });
    }
};

// Delete publisher
const deletePublisher = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if publisher has books
        const bookCount = await prisma.sach.count({
            where: { maNXB: parseInt(id) }
        });

        if (bookCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Không thể xóa NXB này vì có ${bookCount} sách liên quan`
            });
        }

        await prisma.nhaXuatBan.delete({
            where: { maNXB: parseInt(id) }
        });

        res.json({ success: true, message: 'Xóa NXB thành công' });
    } catch (error) {
        console.error('Error deleting publisher:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa NXB' });
    }
};

module.exports = {
    getAllPublishers,
    createPublisher,
    updatePublisher,
    deletePublisher
};
