const prisma = require('../config/database');

// Lấy danh sách quy định
const getAllSettings = async (req, res) => {
    try {
        const settings = await prisma.quyDinh.findMany();

        res.status(200).json({
            success: true,
            data: { settings },
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi lấy danh sách quy định',
        });
    }
};

// Cập nhật quy định
const updateSetting = async (req, res) => {
    try {
        const { id } = req.params; // id là maQuyDinh
        const { giaTri, trangThai } = req.body; // status (true/false) - QuyDinh model doesn't seem to have status, checking schema... Schema has giaTri (String), moTa, tenQuyDinh. No status.

        // Schema: maQuyDinh, tenQuyDinh, giaTri, moTa, ngayCapNhat
        // Chúng ta chỉ cho phép cập nhật giaTri (và có thể moTa)

        if (giaTri === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp giá trị mới',
            });
        }

        const updatedSetting = await prisma.quyDinh.update({
            where: { maQuyDinh: parseInt(id) },
            data: {
                giaTri: String(giaTri),
                ngayCapNhat: new Date(),
            },
        });

        res.status(200).json({
            success: true,
            message: 'Cập nhật quy định thành công',
            data: { setting: updatedSetting },
        });
    } catch (error) {
        console.error('Update setting error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy quy định',
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server khi cập nhật quy định',
        });
    }
};

module.exports = {
    getAllSettings,
    updateSetting,
};
