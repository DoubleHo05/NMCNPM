const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const ensureUploadDir = () => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};

// Process avatar image (base64, URL, or file path)
const processAvatarImage = (imageData) => {
    if (!imageData) return null;

    // If it's a URL (http/https), return as is
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        return imageData;
    }

    // If already a local path
    if (imageData.startsWith('/uploads/')) {
        return imageData;
    }

    // If base64, save to file
    if (imageData.startsWith('data:image/')) {
        return saveBase64Avatar(imageData);
    }

    return imageData;
};

// Save base64 avatar to file
const saveBase64Avatar = (base64Data) => {
    try {
        const uploadDir = ensureUploadDir();

        // Extract extension and data
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
            throw new Error('Invalid base64 image data');
        }

        const ext = matches[1];
        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');

        // Generate unique filename
        const filename = `avatar_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const filePath = path.join(uploadDir, filename);

        // Save file
        fs.writeFileSync(filePath, buffer);
        console.log(`📸 Avatar saved: ${filename}`);

        // Return relative path for database
        return `/uploads/avatars/${filename}`;
    } catch (error) {
        console.error('Error saving avatar:', error);
        return null;
    }
};

// Delete old avatar file
const deleteOldAvatar = (oldAvatarPath) => {
    try {
        if (!oldAvatarPath) return;

        // Only delete local files (starting with /uploads/)
        if (oldAvatarPath.startsWith('/uploads/avatars/')) {
            const fullPath = path.join(__dirname, '../../', oldAvatarPath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
                console.log(`🗑️ Old avatar deleted: ${oldAvatarPath}`);
            }
        }
    } catch (error) {
        console.error('Error deleting old avatar:', error);
    }
};

// Get full avatar URL
const getAvatarUrl = (avatarPath, req) => {
    if (!avatarPath) return null;

    if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
        return avatarPath;
    }

    if (avatarPath.startsWith('data:image/')) {
        return avatarPath;
    }

    if (avatarPath.startsWith('/uploads/')) {
        // Construct full URL including domain
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}${avatarPath}`;
    }

    return avatarPath;
};

module.exports = {
    processAvatarImage,
    saveBase64Avatar,
    deleteOldAvatar,
    getAvatarUrl,
};
