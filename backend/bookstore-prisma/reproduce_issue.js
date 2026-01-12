
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('--- Checking Existing Users ---');
    const users = await prisma.nhanVien.findMany({
        select: { maNV: true, tenDangNhap: true, email: true, trangThai: true }
    });
    console.log(users);

    console.log('\n--- Attempting to create user with new email ---');
    const testEmail = 'unique_test_' + Date.now() + '@gmail.com';
    const testUser = {
        tenDangNhap: 'test_user_' + Date.now(),
        matKhau: '123456',
        hoTen: 'Test User',
        email: testEmail,
        vaiTro: 'THU_NGAN'
    };

    try {
        // Mimic Controller Logic

        // Check username
        const existingUser = await prisma.nhanVien.findFirst({
            where: {
                tenDangNhap: testUser.tenDangNhap,
                trangThai: true
            },
        });
        if (existingUser) console.log('Username exists');

        // Check email
        if (testUser.email) {
            console.log(`Checking email: "${testUser.email}"`);
            const existingEmail = await prisma.nhanVien.findFirst({
                where: {
                    email: testUser.email,
                    email: { not: null }
                },
            });
            if (existingEmail) {
                console.log('!!! Email ALREADY USED according to findFirst !!!');
                console.log('Found user:', existingEmail);
            } else {
                console.log('Email check passed (not found).');

                // Create
                const hashedPassword = await bcrypt.hash(testUser.matKhau, 10);
                const newUser = await prisma.nhanVien.create({
                    data: {
                        ...testUser,
                        matKhau: hashedPassword,
                        email: testUser.email || null,
                        trangThai: true
                    }
                });
                console.log('User created successfully:', newUser.maNV);
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
