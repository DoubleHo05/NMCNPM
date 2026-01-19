const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.phieuThuTien.count();
        console.log(`Tổng số phiếu thu: ${count}`);

        const payments = await prisma.phieuThuTien.findMany({
            take: 5,
            orderBy: { ngayThu: 'desc' },
            include: {
                hoaDon: {
                    include: {
                        khachHang: true
                    }
                }
            }
        });

        if (payments.length > 0) {
            console.log('5 phiếu thu mới nhất:');
            payments.forEach(p => {
                console.log(`- Mã: ${p.maPhieuThu}, Tiền: ${p.soTienThu}, Ngày: ${p.ngayThu}, Khách: ${p.hoaDon?.khachHang?.tenKH || 'N/A'}`);
            });
        } else {
            console.log('Không có phiếu thu nào.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
