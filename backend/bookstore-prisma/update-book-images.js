const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(__dirname, 'uploads/books');

// Ensure upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Map book IDs to English search terms (works better with Google Books)
const bookSearchTerms = {
    1: 'mat biec nguyen nhat anh',
    2: 'toi thay hoa vang nguyen nhat anh',
    3: 'cho toi xin mot ve di tuoi tho',
    4: 'canh dong bat tan nguyen ngoc tu',
    5: 'how to win friends dale carnegie',
    6: 'the alchemist paulo coelho',
    7: 'tuoi tre dang gia bao nhieu rosie nguyen',
    8: 'the monk who sold his ferrari',
    9: 'de men phieu luu ky to hoai',
    10: 'chi pheo nam cao',
    11: 'so do vu trong phung',
    12: 'tat den ngo tat to',
    13: 'rich dad poor dad kiyosaki',
    14: 'think and grow rich napoleon hill',
    15: 'mind map book tony buzan',
    16: 'ngay xua co mot chuyen tinh nguyen nhat anh',
    17: 'a brief history of time hawking',
    18: 'sapiens yuval harari',
    19: 'nhat ky dang thuy tram',
    20: 'doraemon volume 1',
    21: 'detective conan volume 1',
    22: 'how the steel was tempered ostrovsky',
    23: 'how to analyze people',
    24: 'sans famille hector malot',
    25: 'harry potter sorcerers stone',
    26: 'the little prince saint exupery',
    27: 'muon kiep nhan sinh nguyen phong',
    28: 'secrets of the millionaire mind',
    29: 'richest man in babylon',
    30: 'chicken soup for the soul'
};

async function getBookCover(searchTerm) {
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: { q: searchTerm, maxResults: 1 },
            timeout: 10000
        });

        const book = response.data.items?.[0];
        if (book?.volumeInfo?.imageLinks?.thumbnail) {
            return book.volumeInfo.imageLinks.thumbnail
                .replace('http://', 'https://')
                .replace('zoom=1', 'zoom=2');
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function downloadImage(url, filename) {
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        // Check if response is actually an image (more than 1KB)
        if (response.data.length < 1000) {
            return null;
        }

        const filepath = path.join(UPLOAD_DIR, filename);
        fs.writeFileSync(filepath, response.data);
        return `/uploads/books/${filename}`;
    } catch (e) {
        return null;
    }
}

async function updateAllBookImages() {
    console.log('🖼️ Updating ALL book images...\n');

    let updated = 0;

    for (const [maSach, searchTerm] of Object.entries(bookSearchTerms)) {
        const id = parseInt(maSach);
        console.log(`[${id}/30] Searching: ${searchTerm}`);

        const coverUrl = await getBookCover(searchTerm);

        if (coverUrl) {
            const filename = `book_${id}.jpg`;
            const localPath = await downloadImage(coverUrl, filename);

            if (localPath) {
                await prisma.sach.update({
                    where: { maSach: id },
                    data: { hinhAnh: localPath }
                });
                console.log(`   ✅ Saved: ${filename}`);
                updated++;
            } else {
                console.log(`   ❌ Download failed`);
            }
        } else {
            console.log(`   ❌ No cover found`);
        }

        await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n🎉 Done! Updated ${updated}/30 books`);
}

updateAllBookImages()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
    });
