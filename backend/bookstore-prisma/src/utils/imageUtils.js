const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Thư mục lưu ảnh
const UPLOAD_DIR = path.join(__dirname, '../../uploads/books');

// Đảm bảo thư mục tồn tại
function ensureUploadDir() {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
}

/**
 * Xử lý ảnh sách - hỗ trợ 3 loại:
 * 1. URL (http/https) - giữ nguyên
 * 2. Base64 - lưu thành file
 * 3. File path - giữ nguyên (ảnh đã upload)
 * 
 * @param {string} imageData - URL, Base64, hoặc file path
 * @returns {string} - URL hoặc đường dẫn file để lưu vào database
 */
function processBookImage(imageData) {
    if (!imageData) return null;

    // 1. Nếu là URL (http/https) - giữ nguyên
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        return imageData;
    }

    // 2. Nếu là file path đã lưu (/uploads/...) - giữ nguyên
    if (imageData.startsWith('/uploads/')) {
        return imageData;
    }

    // 3. Nếu là Base64 - lưu thành file
    if (imageData.startsWith('data:image/')) {
        return saveBase64Image(imageData);
    }

    // Các trường hợp khác - giữ nguyên
    return imageData;
}

/**
 * Lưu ảnh Base64 thành file
 * @param {string} base64Data - data:image/png;base64,xxxxx
 * @returns {string} - đường dẫn file /uploads/books/filename.ext
 */
function saveBase64Image(base64Data) {
    try {
        ensureUploadDir();

        // Tách header và data
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            console.error('Invalid base64 image format');
            return base64Data; // Trả về nguyên nếu không parse được
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = matches[2];

        // Tạo tên file unique
        const filename = `book_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Ghi file
        fs.writeFileSync(filepath, Buffer.from(data, 'base64'));

        console.log(`📸 Image saved: ${filename}`);
        return `/uploads/books/${filename}`;

    } catch (error) {
        console.error('Error saving image:', error);
        return base64Data; // Trả về nguyên nếu lỗi
    }
}

/**
 * Xóa file ảnh cũ khi cập nhật
 * @param {string} oldImagePath - đường dẫn ảnh cũ
 */
function deleteOldImage(oldImagePath) {
    try {
        if (!oldImagePath) return;

        // Chỉ xóa file local, không xóa URL
        if (oldImagePath.startsWith('/uploads/')) {
            const fullPath = path.join(__dirname, '../..', oldImagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`🗑️ Deleted old image: ${oldImagePath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting old image:', error);
    }
}

/**
 * Lấy URL ảnh để hiển thị
 * @param {string} imagePath - đường dẫn ảnh trong database
 * @param {object} req - Express request object
 * @returns {string} - URL đầy đủ
 */
function getImageUrl(imagePath, req) {
    if (!imagePath) return null;

    // Nếu là URL đầy đủ - giữ nguyên
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Nếu là Base64 - giữ nguyên (hiển thị trực tiếp)
    if (imagePath.startsWith('data:image/')) {
        return imagePath;
    }

    // Nếu là file local - tạo URL đầy đủ
    if (imagePath.startsWith('/uploads/')) {
        const baseUrl = req ? `${req.protocol}://${req.get('host')}` : '';
        return `${baseUrl}${imagePath}`;
    }

    return imagePath;
}

module.exports = {
    processBookImage,
    saveBase64Image,
    deleteOldImage,
    getImageUrl,
    UPLOAD_DIR
};
