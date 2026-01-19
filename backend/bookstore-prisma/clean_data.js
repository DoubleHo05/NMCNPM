const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start cleaning invoice data...');

    try {
        // Delete dependent records first
        console.log('Deleting ChiTietHoaDon...');
        await prisma.chiTietHoaDon.deleteMany({});

        console.log('Deleting PhieuThuTien...');
        await prisma.phieuThuTien.deleteMany({});

        // Delete main records
        console.log('Deleting HoaDonBanSach...');
        await prisma.hoaDonBanSach.deleteMany({});

        console.log('Successfully cleaned all invoice data!');
    } catch (error) {
        console.error('Error cleaning data:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
