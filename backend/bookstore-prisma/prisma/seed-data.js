const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Seed database with 6 months of sales data
 */
async function seedDatabase() {
    console.log('🌱 Starting database seed...');

    // Get existing data
    const books = await prisma.sach.findMany();
    const customers = await prisma.khachHang.findMany();
    const employees = await prisma.nhanVien.findMany();

    if (books.length === 0) {
        console.log('❌ No books found. Please add books first.');
        return;
    }

    if (employees.length === 0) {
        console.log('❌ No employees found. Please add employees first.');
        return;
    }

    console.log(`📚 Found ${books.length} books, ${customers.length} customers, ${employees.length} employees`);

    // Generate 6 months of data
    const today = new Date();
    let totalOrders = 0;
    let totalRevenue = 0;

    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
        const month = new Date(today);
        month.setMonth(month.getMonth() - monthOffset);

        // 20-40 orders per month
        const ordersThisMonth = 20 + Math.floor(Math.random() * 20);

        for (let i = 0; i < ordersThisMonth; i++) {
            // Random day in month
            const orderDate = new Date(month.getFullYear(), month.getMonth(), 1 + Math.floor(Math.random() * 28));

            // Random employee and customer
            const employee = employees[Math.floor(Math.random() * employees.length)];
            const customer = customers.length > 0 ? customers[Math.floor(Math.random() * customers.length)] : null;

            // 1-3 items per order
            const itemCount = 1 + Math.floor(Math.random() * 3);
            let orderTotal = 0;
            const orderItems = [];

            for (let j = 0; j < itemCount; j++) {
                const book = books[Math.floor(Math.random() * books.length)];
                const quantity = 1 + Math.floor(Math.random() * 3);
                const price = Number(book.giaBanLe);
                const itemTotal = quantity * price;

                orderItems.push({
                    maSach: book.maSach,
                    soLuongBan: quantity,
                    giaBan: price,
                    thanhTien: itemTotal
                });

                orderTotal += itemTotal;
            }

            try {
                // Create order
                const order = await prisma.hoaDonBanSach.create({
                    data: {
                        maNV: employee.maNV,
                        maKH: customer?.maKH || null,
                        ngayBan: orderDate,
                        tongTien: orderTotal,
                        tienGiamGia: 0,
                        thanhTien: orderTotal
                    }
                });

                // Create order items
                for (const item of orderItems) {
                    await prisma.chiTietHoaDon.create({
                        data: {
                            maHoaDon: order.maHoaDon,
                            maSach: item.maSach,
                            soLuongBan: item.soLuongBan,
                            giaBan: item.giaBan,
                            thanhTien: item.thanhTien
                        }
                    });
                }

                // Create payment
                await prisma.phieuThuTien.create({
                    data: {
                        maHoaDon: order.maHoaDon,
                        soTienThu: orderTotal,
                        ngayThu: orderDate,
                        phuongThucThanhToan: ['TIEN_MAT', 'THE_NGAN_HANG', 'VI_DIEN_TU'][Math.floor(Math.random() * 3)]
                    }
                });

                totalOrders++;
                totalRevenue += orderTotal;
            } catch (error) {
                console.error('Order error:', error.message);
            }
        }

        console.log(`📅 Month ${6 - monthOffset}: ${ordersThisMonth} orders created`);
    }

    console.log('\n✅ Seed completed!');
    console.log(`📊 Total orders: ${totalOrders}`);
    console.log(`💰 Total revenue: ${totalRevenue.toLocaleString('vi-VN')}đ`);
}

// Run seed
seedDatabase()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error('Seed error:', e);
        prisma.$disconnect();
        process.exit(1);
    });
