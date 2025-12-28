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

  console.log('Đang tạo dữ liệu mới từ qlbansach.sql...');

  // Hash password cho tất cả nhân viên (password gốc: 123456)
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Thêm Thể loại
  const theLoai = await prisma.theLoai.createMany({
    data: [
      { tenTheLoai: 'Tiểu thuyết' },
      { tenTheLoai: 'Kinh tế' },
      { tenTheLoai: 'Công nghệ thông tin' },
      { tenTheLoai: 'Tâm lý - Kỹ năng sống' },
      { tenTheLoai: 'Truyện tranh' },
    ]
  });

  // 2. Thêm Tác giả
  const tacGia = await prisma.tacGia.createMany({
    data: [
      { tenTacGia: 'Nguyễn Nhật Ánh' },
      { tenTacGia: 'J.K. Rowling' },
      { tenTacGia: 'Philip Kotler' },
      { tenTacGia: 'Robert C. Martin' },
      { tenTacGia: 'Dale Carnegie' },
    ]
  });

  // 3. Thêm Nhà xuất bản
  const nxb = await prisma.nhaXuatBan.createMany({
    data: [
      { tenNXB: 'NXB Trẻ', diaChi: '161B Lý Chính Thắng, Q.3, TP.HCM', soDienThoai: '02839316289' },
      { tenNXB: 'NXB Kim Đồng', diaChi: '55 Quang Trung, Hà Nội', soDienThoai: '02439434730' },
      { tenNXB: 'NXB Lao Động', diaChi: '175 Giảng Võ, Hà Nội', soDienThoai: '02438515380' },
    ]
  });

  // 4. Thêm Nhân viên (Mật khẩu đã được hash)
  const nhanVien = await prisma.nhanVien.createMany({
    data: [
      { tenDangNhap: 'admin', matKhau: hashedPassword, hoTen: 'Nguyễn Văn Quản Lý', vaiTro: 'QUAN_LY', trangThai: true },
      { tenDangNhap: 'thukho01', matKhau: hashedPassword, hoTen: 'Trần Thị Kho', vaiTro: 'THU_KHO', trangThai: true },
      { tenDangNhap: 'thungan01', matKhau: hashedPassword, hoTen: 'Lê Văn Thu Ngân', vaiTro: 'THU_NGAN', trangThai: true },
    ]
  });

  // 5. Thêm Khách hàng
  const khachHang = await prisma.khachHang.createMany({
    data: [
      { tenKH: 'Phạm Minh Tuấn', soDienThoai: '0909123456', email: 'tuan.pham@email.com', diemTichLuy: 10 },
      { tenKH: 'Trần Thu Hà', soDienThoai: '0918123789', email: 'ha.tran@email.com', diemTichLuy: 50 },
      { tenKH: 'Khách vãng lai', soDienThoai: null, email: null, diemTichLuy: 0 },
    ]
  });

  // 6. Thêm Quy định (đầy đủ các quy định cho hệ thống)
  const quyDinh = await prisma.quyDinh.createMany({
    data: [
      { tenQuyDinh: 'SoLuongNhapToiThieu', giaTri: '150', moTa: 'Số lượng nhập ít nhất cho mỗi đầu sách' },
      { tenQuyDinh: 'TonKhoToiThieu', giaTri: '300', moTa: 'Chỉ nhập khi tồn kho ít hơn giá trị này' },
      { tenQuyDinh: 'NoCuoiToiDa', giaTri: '20000', moTa: 'Nợ tối đa của khách hàng (đồng)' },
      { tenQuyDinh: 'TonKhoSauBanToiThieu', giaTri: '20', moTa: 'Tồn kho tối thiểu sau khi bán' },
      { tenQuyDinh: 'SuDungQuyDinhThuTien', giaTri: 'true', moTa: 'Sử dụng quy định số tiền thu không vượt quá nợ' },
    ]
  });

  // Lấy các ID vừa tạo
  const allTheLoai = await prisma.theLoai.findMany();
  const allNXB = await prisma.nhaXuatBan.findMany();
  const allTacGia = await prisma.tacGia.findMany();
  const allNhanVien = await prisma.nhanVien.findMany();
  const allKhachHang = await prisma.khachHang.findMany();

  // 7. Thêm Sách
  const sach = await prisma.sach.createMany({
    data: [
      { 
        isbn: '978604105', 
        tenSach: 'Mắt Biếc', 
        maTheLoai: allTheLoai.find(t => t.tenTheLoai === 'Tiểu thuyết')?.maTheLoai,
        maNXB: allNXB.find(n => n.tenNXB === 'NXB Trẻ')?.maNXB,
        giaNhap: 70000, 
        giaBanLe: 110000, 
        soLuongTon: 100,
        moTa: 'Tiểu thuyết lãng mạn của Nguyễn Nhật Ánh'
      },
      { 
        isbn: '978054501', 
        tenSach: 'Harry Potter và Hòn đá phù thủy', 
        maTheLoai: allTheLoai.find(t => t.tenTheLoai === 'Tiểu thuyết')?.maTheLoai,
        maNXB: allNXB.find(n => n.tenNXB === 'NXB Trẻ')?.maNXB,
        giaNhap: 150000, 
        giaBanLe: 250000, 
        soLuongTon: 50,
        moTa: 'Tập 1 bộ truyện Harry Potter'
      },
      { 
        isbn: '978013214', 
        tenSach: 'Clean Code', 
        maTheLoai: allTheLoai.find(t => t.tenTheLoai === 'Công nghệ thông tin')?.maTheLoai,
        maNXB: allNXB.find(n => n.tenNXB === 'NXB Lao Động')?.maNXB,
        giaNhap: 400000, 
        giaBanLe: 600000, 
        soLuongTon: 20,
        moTa: 'Sách gối đầu giường cho lập trình viên'
      },
      { 
        isbn: '978123456', 
        tenSach: 'Đắc Nhân Tâm', 
        maTheLoai: allTheLoai.find(t => t.tenTheLoai === 'Tâm lý - Kỹ năng sống')?.maTheLoai,
        maNXB: allNXB.find(n => n.tenNXB === 'NXB Lao Động')?.maNXB,
        giaNhap: 50000, 
        giaBanLe: 86000, 
        soLuongTon: 30,
        moTa: 'Nghệ thuật thu phục lòng người'
      },
    ]
  });

  // Lấy tất cả sách
  const allSach = await prisma.sach.findMany();

  // 8. Liên kết Sách và Tác giả
  await prisma.sachTacGia.createMany({
    data: [
      { 
        maSach: allSach.find(s => s.tenSach === 'Mắt Biếc')?.maSach, 
        maTacGia: allTacGia.find(t => t.tenTacGia === 'Nguyễn Nhật Ánh')?.maTacGia 
      },
      { 
        maSach: allSach.find(s => s.tenSach === 'Harry Potter và Hòn đá phù thủy')?.maSach, 
        maTacGia: allTacGia.find(t => t.tenTacGia === 'J.K. Rowling')?.maTacGia 
      },
      { 
        maSach: allSach.find(s => s.tenSach === 'Clean Code')?.maSach, 
        maTacGia: allTacGia.find(t => t.tenTacGia === 'Robert C. Martin')?.maTacGia 
      },
      { 
        maSach: allSach.find(s => s.tenSach === 'Đắc Nhân Tâm')?.maSach, 
        maTacGia: allTacGia.find(t => t.tenTacGia === 'Dale Carnegie')?.maTacGia 
      },
    ]
  });

  console.log('Seed dữ liệu thành công!');
  console.log('--- Thông tin đăng nhập ---');
  console.log('Username: admin | Password: 123456 | Vai trò: QUAN_LY');
  console.log('Username: thukho01 | Password: 123456 | Vai trò: THU_KHO');
  console.log('Username: thungan01 | Password: 123456 | Vai trò: THU_NGAN');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });