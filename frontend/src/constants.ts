import type { Book, Customer, SystemRules } from './types';

export const INITIAL_RULES: SystemRules = {
  minImportQuantity: 150,
  maxStockBeforeImport: 300,
  maxCustomerDebt: 20000,
  minStockAfterSale: 20,
  usePaymentRule: true,
};

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'B001',
    title: 'Mưa Đỏ',
    category: 'Văn học',
    author: 'Chu Lai',
    stock: 250,
    price: 184500,
    publisher: 'Quân Đội Nhân Dân',
    publishYear: 2025,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935075959187.jpg',
    weight: 350,
    pages: 334,
    dimensions: '22 x 14 x 1.6 cm',
    supplier: 'Cty Tri Thức Văn Hóa Sách VN',
    coverForm: 'Bìa Mềm',
    description: 'Những miền cảm xúc đan xen giữa nụ cười - nước mắt, nỗi đau - niềm vui, sự sống - cái chết, những thăng hoa - mất mát, sự hy sinh của những người cha, người chồng, người con, những người lính, những đồng chí, đồng đội đã không tiếc máu xương trong cuộc chiến đấu 81 ngày đêm bảo vệ thành Cổ Quảng Trị, bảo vệ Tổ quốc với những gian khổ, thiếu thốn lẫn những mất mát đau thương. Đó là một tiểu đội có 7 người lính với 7 tính cách, số phận, suy nghĩ và xuất thân khác nhau. Có người lãng tử, có người bộc trực, có anh lính nhút nhát, có anh lính gan dạ nhưng hơn tất cả họ là một gia đình, luôn có nhau dù đang giữa ranh giới mong manh sự sống và cái chết cận kề.'
  },
  {
    id: 'B002',
    title: 'Marie Curie',
    category: 'Tiểu sử',
    author: 'Hoài Nam',
    stock: 400,
    price: 156000,
    publisher: 'NXB Thanh Niên',
    publishYear: 2021,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_43037.jpg',
    weight: 240,
    pages: 213,
    dimensions: '20.5 x 14.5 cm',
    supplier: 'Đinh Tị',
    coverForm: 'Bìa Mềm',
    description: 'Cuốn sách kể về cuộc đời và sự nghiệp của nữ bác học Marie Curie, người phụ nữ đầu tiên nhận giải Nobel và là người duy nhất nhận giải Nobel ở hai lĩnh vực khác nhau.'
  },
  {
    id: 'B003',
    title: 'Dế Mèn Phiêu Lưu Ký',
    category: 'Thiếu nhi',
    author: 'Tô Hoài',
    stock: 25,
    price: 50000,
    publisher: 'NXB Kim Đồng',
    publishYear: 2020,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg',
    weight: 180,
    pages: 150,
    dimensions: '19 x 13 cm',
    supplier: 'NXB Kim Đồng',
    coverForm: 'Bìa Mềm',
    description: 'Tác phẩm văn học thiếu nhi kinh điển của Việt Nam, kể về những cuộc phiêu lưu của chú Dế Mèn qua thế giới loài vật.'
  },
  {
    id: 'B004',
    title: 'Nhà Giả Kim',
    category: 'Văn học',
    author: 'Paulo Coelho',
    stock: 100,
    price: 85000,
    publisher: 'NXB Văn Học',
    publishYear: 2022,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_41986.jpg',
    weight: 200,
    pages: 220,
    dimensions: '20 x 13 cm',
    supplier: 'Nhã Nam',
    coverForm: 'Bìa Mềm',
    description: 'Tiểu thuyết nổi tiếng nhất của Paulo Coelho về hành trình theo đuổi ước mơ của chàng chăn cừu Santiago.'
  },
  {
    id: 'B005',
    title: 'Đắc Nhân Tâm',
    category: 'Kỹ năng',
    author: 'Dale Carnegie',
    stock: 500,
    price: 90000,
    publisher: 'First News',
    publishYear: 2023,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_51034.jpg',
    weight: 300,
    pages: 320,
    dimensions: '24 x 16 cm',
    supplier: 'First News - Trí Việt',
    coverForm: 'Bìa Mềm',
    description: 'Cuốn sách nổi tiếng nhất về nghệ thuật thu phục lòng người, giúp bạn thành công trong giao tiếp và cuộc sống.'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'C001',
    name: 'Nguyễn Văn A',
    phone: '0909123456',
    address: '123 Lê Lợi, TP.HCM',
    email: 'nguyenvana@gmail.com',
    currentDebt: 15000,
  },
  {
    id: 'C002',
    name: 'Trần Thị B',
    phone: '0909987654',
    address: '456 Nguyễn Huệ, TP.HCM',
    email: 'tranthib@gmail.com',
    currentDebt: 50000,
  },
  {
    id: 'C003',
    name: 'Lê Văn C',
    phone: '0912345678',
    address: '789 Võ Văn Tần, TP.HCM',
    email: 'levanc@gmail.com',
    currentDebt: 0,
  }
];