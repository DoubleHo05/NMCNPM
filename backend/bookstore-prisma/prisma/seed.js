const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('Đang xóa dữ liệu cũ...');
  // Xóa theo thứ tự ngược lại để tránh lỗi Foreign Key
  await prisma.sachTacGia.deleteMany({});
  await prisma.chiTietHoaDon.deleteMany({});
  await prisma.chiTietPhieuNhap.deleteMany({});
  await prisma.phieuThuTien.deleteMany({});
  await prisma.hoaDonBanSach.deleteMany({});
  await prisma.phieuNhapSach.deleteMany({});
  await prisma.sach.deleteMany({});
  await prisma.tacGia.deleteMany({});
  await prisma.nhanVien.deleteMany({});
  await prisma.khachHang.deleteMany({});
  await prisma.theLoai.deleteMany({});
  await prisma.nhaXuatBan.deleteMany({});
  await prisma.quyDinh.deleteMany({});

  console.log('Đang tạo dữ liệu mới...');

  // 1. Thể loại
  const tl1 = await prisma.theLoai.create({ data: { tenTheLoai: 'Tiểu thuyết' } });
  const tl2 = await prisma.theLoai.create({ data: { tenTheLoai: 'Công nghệ thông tin' } });

  // 2. Tác giả
  const tg1 = await prisma.tacGia.create({ data: { tenTacGia: 'Nguyễn Nhật Ánh' } });
  const tg2 = await prisma.tacGia.create({ data: { tenTacGia: 'Robert C. Martin' } });

  // 3. NXB
  const nxb1 = await prisma.nhaXuatBan.create({ data: { tenNXB: 'NXB Trẻ', diaChi: 'TP.HCM' } });

  // 4. Nhân viên (mật khẩu được hash)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedPassword2 = await bcrypt.hash('warehouse123', 10);

  const nv = await prisma.nhanVien.create({
    data: {
      tenDangNhap: 'admin',
      matKhau: hashedPassword,
      hoTen: 'Nguyễn Văn Quản Lý',
      email: 'admin@bookstore.com',
      vaiTro: 'QUAN_LY',
      trangThai: true
    }
  });

  // Tạo thêm user cho warehouse
  const nv_warehouse = await prisma.nhanVien.create({
    data: {
      tenDangNhap: 'warehouse',
      matKhau: hashedPassword2,
      hoTen: 'Trần Văn Thủ Kho',
      email: 'warehouse@bookstore.com',
      vaiTro: 'THU_KHO',
      trangThai: true
    }
  });

  // 5. Quy định
  await prisma.quyDinh.create({
    data: { tenQuyDinh: 'SoLuongNhapToiThieu', giaTri: '10' }
  });

  // 6. Sách
  const s1 = await prisma.sach.create({
    data: {
      tenSach: 'Mắt Biếc',
      isbn: '978604105',
      maTheLoai: tl1.maTheLoai,
      maNXB: nxb1.maNXB,
      giaNhap: 70000,
      giaBanLe: 110000,
      soLuongTon: 100
    }
  });

  // 7. Liên kết Sách - Tác giả
  await prisma.sachTacGia.create({
    data: { maSach: s1.maSach, maTacGia: tg1.maTacGia }
  });

  console.log('Seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });