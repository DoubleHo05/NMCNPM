const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
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

  // 4. Nhân viên (với mật khẩu đã hash)
  const hashedPassword = await bcrypt.hash('123456', 10);
  const nv = await prisma.nhanVien.create({
    data: {
      tenDangNhap: 'admin',
      matKhau: hashedPassword,
      hoTen: 'Nguyễn Văn Quản Lý',
      vaiTro: 'QUAN_LY'
    }
  });

  // Thêm nhân viên thu ngân
  const nvThuNgan = await prisma.nhanVien.create({
    data: {
      tenDangNhap: 'thungan',
      matKhau: hashedPassword,
      hoTen: 'Trần Thị Thu Ngân',
      vaiTro: 'THU_NGAN'
    }
  });

  // Thêm nhân viên thủ kho
  const nvThuKho = await prisma.nhanVien.create({
    data: {
      tenDangNhap: 'thukho',
      matKhau: hashedPassword,
      hoTen: 'Lê Văn Thủ Kho',
      vaiTro: 'THU_KHO'
    }
  });

  // 5. Khách hàng
  const kh1 = await prisma.khachHang.create({
    data: {
      tenKH: 'Nguyễn Văn A',
      soDienThoai: '0901234567',
      email: 'nguyenvana@email.com',
      diaChi: '123 Đường ABC, Quận 1, TP.HCM',
      diemTichLuy: 100,
      congNo: 0
    }
  });

  const kh2 = await prisma.khachHang.create({
    data: {
      tenKH: 'Trần Thị B',
      soDienThoai: '0912345678',
      email: 'tranthib@email.com',
      diaChi: '456 Đường XYZ, Quận 3, TP.HCM',
      diemTichLuy: 50,
      congNo: 15000  // Khách hàng có công nợ
    }
  });

  // 6. Quy định
  await prisma.quyDinh.create({
    data: { tenQuyDinh: 'SoLuongNhapToiThieu', giaTri: '10', moTa: 'Số lượng nhập tối thiểu mỗi đầu sách' }
  });

  await prisma.quyDinh.create({
    data: { tenQuyDinh: 'TonToiThieuSauBan', giaTri: '20', moTa: 'Số lượng tồn tối thiểu sau khi bán' }
  });

  await prisma.quyDinh.create({
    data: { tenQuyDinh: 'NoToiDa', giaTri: '20000', moTa: 'Số tiền nợ tối đa của khách hàng' }
  });

  await prisma.quyDinh.create({
    data: { tenQuyDinh: 'GioiHanThuTien', giaTri: 'true', moTa: 'Có giới hạn số tiền thu không vượt quá công nợ' }
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