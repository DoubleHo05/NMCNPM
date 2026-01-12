const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const bookCount = await prisma.sach.count();
        console.log(`Initial Book Count: ${bookCount}`);

        const books = await prisma.sach.findMany({
            take: 5,
            include: {
                theLoai: true
            }
        });
        console.log('Books in DB:', JSON.stringify(books, null, 2));

        if (bookCount === 0) {
            console.log('Database seems empty of books.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
