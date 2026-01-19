// Helper to get full image URL
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';

    // If it's a full URL or data URI, return as is
    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }

    // If it's a relative path starting with /uploads, prepend backend URL
    if (path.startsWith('/uploads')) {
        return `http://localhost:5000${path}?t=${new Date().getTime()}`;
    }

    return path;
};

// Start with standard avatar URL generator (ui-avatars.com)
export const getAvatarUrl = (user: any): string => {
    if (!user) return `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`;

    // If user has custom avatar (and it's not empty)
    if (user.avatar && user.avatar.trim() !== '') {
        const fullUrl = getImageUrl(user.avatar);
        if (fullUrl) return fullUrl;
    }

    // Generate from name
    const name = user.hoTen || user.tenDangNhap || 'User';
    const parts = name.trim().split(' ').filter((p: string) => p);

    let initials = 'U';
    if (parts.length > 0) {
        if (parts.length === 1) initials = parts[0].charAt(0).toUpperCase();
        else initials = (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=0D8ABC&color=fff`;
};
