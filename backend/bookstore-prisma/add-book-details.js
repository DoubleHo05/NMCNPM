const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fahasa-style book details with real attributes
const bookDetails = [
    { id: 1, pages: 296, weight: 250, size: '13x20.5 cm', year: 2019 },
    { id: 2, pages: 378, weight: 380, size: '14.5x20.5 cm', year: 2018 },
    { id: 3, pages: 218, weight: 230, size: '13x20.5 cm', year: 2018 },
    { id: 4, pages: 224, weight: 220, size: '13x20.5 cm', year: 2017 },
    { id: 5, pages: 320, weight: 300, size: '14.5x20.5 cm', year: 2016 },
    { id: 6, pages: 228, weight: 220, size: '13x20.5 cm', year: 2020 },
    { id: 7, pages: 285, weight: 280, size: '13x20.5 cm', year: 2017 },
    { id: 8, pages: 168, weight: 180, size: '12x20 cm', year: 2019 },
    { id: 9, pages: 192, weight: 200, size: '14.5x20.5 cm', year: 2020 },
    { id: 10, pages: 80, weight: 100, size: '13x19 cm', year: 2018 },
    { id: 11, pages: 320, weight: 350, size: '14.5x20.5 cm', year: 2017 },
    { id: 12, pages: 256, weight: 280, size: '14.5x20.5 cm', year: 2019 },
    { id: 13, pages: 368, weight: 400, size: '15.5x23 cm', year: 2020 },
    { id: 14, pages: 352, weight: 380, size: '14.5x20.5 cm', year: 2019 },
    { id: 15, pages: 280, weight: 320, size: '15.5x23 cm', year: 2018 },
    { id: 16, pages: 285, weight: 280, size: '13x20.5 cm', year: 2016 },
    { id: 17, pages: 280, weight: 320, size: '14.5x20.5 cm', year: 2017 },
    { id: 18, pages: 560, weight: 550, size: '15.5x23 cm', year: 2019 },
    { id: 19, pages: 320, weight: 280, size: '14x21 cm', year: 2015 },
    { id: 20, pages: 48, weight: 80, size: '11.5x17.5 cm', year: 2020 },
    { id: 21, pages: 52, weight: 85, size: '11.5x17.5 cm', year: 2020 },
    { id: 22, pages: 544, weight: 480, size: '14.5x20.5 cm', year: 2018 },
    { id: 23, pages: 208, weight: 220, size: '13x20.5 cm', year: 2019 },
    { id: 24, pages: 416, weight: 400, size: '14.5x20.5 cm', year: 2017 },
    { id: 25, pages: 366, weight: 380, size: '14.5x20.5 cm', year: 2020 },
    { id: 26, pages: 128, weight: 150, size: '14x21 cm', year: 2019 },
    { id: 27, pages: 504, weight: 500, size: '15.5x23 cm', year: 2020 },
    { id: 28, pages: 320, weight: 350, size: '14.5x20.5 cm', year: 2018 },
    { id: 29, pages: 256, weight: 280, size: '14.5x20.5 cm', year: 2017 },
    { id: 30, pages: 288, weight: 300, size: '13x20.5 cm', year: 2019 }
];

async function updateBookDetails() {
    console.log('📚 Adding Fahasa-style book details...\n');

    // First, add columns if they don't exist
    try {
        await prisma.$executeRawUnsafe(`
      ALTER TABLE sach 
      ADD COLUMN IF NOT EXISTS SoTrang INT NULL,
      ADD COLUMN IF NOT EXISTS TrongLuong INT NULL,
      ADD COLUMN IF NOT EXISTS KichThuoc VARCHAR(50) NULL,
      ADD COLUMN IF NOT EXISTS NamXuatBan INT NULL
    `);
        console.log('✅ Columns added/verified\n');
    } catch (e) {
        // Columns might already exist, that's ok
        console.log('ℹ️ Columns may already exist, continuing...\n');
    }

    // Update each book
    for (const book of bookDetails) {
        await prisma.$executeRawUnsafe(`
      UPDATE sach SET 
        SoTrang = ${book.pages},
        TrongLuong = ${book.weight},
        KichThuoc = '${book.size}',
        NamXuatBan = ${book.year}
      WHERE MaSach = ${book.id}
    `);
        console.log(`✅ Book ${book.id}: ${book.pages} trang, ${book.weight}g, ${book.size}, ${book.year}`);
    }

    console.log('\n🎉 Done! All 30 books updated with Fahasa-style details');
}

updateBookDetails()
    .then(() => prisma.$disconnect())
    .catch(e => {
        console.error(e);
        prisma.$disconnect();
    });
