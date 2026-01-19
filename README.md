# 📚 Bookstore Management System - HOÀN THIỆN

## 👥 Nhóm Phát Triển

### **Trân - Frontend Lead + UI Admin & Kho**
**Vai trò:** Dựng khung dự án React và các màn hình quản trị

**Tình trạng hoàn thành:**
- ✅ **Setup:** Cấu trúc folder React, Ant Design, Redux/Context API, Axios
  - Redux store setup hoàn chỉnh (user, rules, warehouse slices)
  - Axios interceptor với JWT token
  - Tailwind CSS + Ant Design integration
  
- ✅ **UI Admin:**
  - Màn hình User Management (CRUD người dùng)
  - Màn hình Rules Config (CRUD quy định hệ thống)
  
- ✅ **UI Kho:**
  - Màn hình Warehouse Import (Form phức tạp nhập kho)
  - Màn hình Warehouse List (Danh sách kho + thống kê)

---

## 🔧 Yêu Cầu Hệ Thống

- **Node.js**: v18+ (khuyến nghị v20+)
- **npm**: v9+
- **Database**: MySQL 5.7+ hoặc MariaDB
- **Port yêu cầu**: 3307 (MySQL), 5000 (Backend), 5173 (Frontend)

---

## 📦 Cài Đặt & Chạy Ứng Dụng

### **1️⃣ Chuẩn Bị Database MySQL**

Mở Command Prompt/PowerShell:

```powershell
# Kết nối MySQL (thay đổi user/password nếu cần)
mysql -h localhost -P 3307 -u root -p

# Sau khi nhập password, tạo database:
CREATE DATABASE IF NOT EXISTS bansach;
USE bansach;

# Thoát MySQL
exit
```

**Hoặc nếu MySQL chưa có sẵn:**
- Cài đặt [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- Hoặc dùng [XAMPP](https://www.apachefriends.org/) (MySQL có sẵn)

---

### **2️⃣ Cài Đặt & Chạy Backend**

```powershell
# Vào thư mục backend
cd backend/bookstore-prisma

# Cài đặt dependencies
npm install

# Tạo database schema từ Prisma
npx prisma migrate dev --name init

# (Tùy chọn) Seed dữ liệu mẫu
npx prisma db seed

# Chạy backend server
npm run dev
```

✅ Backend sẽ chạy tại: **http://localhost:5000**

**Các API endpoints đã có:**
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `GET /users` - Danh sách người dùng (Admin)
- `GET /rules` - Danh sách quy định
- `GET /warehouse/items` - Danh sách kho
- `POST /warehouse/imports` - Tạo phiếu nhập kho

---

### **3️⃣ Cài Đặt & Chạy Frontend**

Mở **terminal mới**:

```powershell
# Vào thư mục frontend
cd frontend

# Cài đặt dependencies (nếu chưa cài)
npm install

# Chạy dev server
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173**

---

## 🗂️ Cấu Trúc Frontend

```
frontend/
├── src/
│   ├── api/                          # API calls
│   │   ├── axiosInstance.ts          # Axios config + JWT interceptor
│   │   ├── userApi.ts                # User API endpoints
│   │   ├── rulesApi.ts               # Rules API endpoints
│   │   └── warehouseApi.ts           # Warehouse API endpoints
│   │
│   ├── pages/                        # React Pages
│   │   ├── admin/
│   │   │   ├── UserManagement.tsx    # ✅ Quản lý người dùng (CRUD)
│   │   │   └── RulesConfig.tsx       # ✅ Cấu hình quy định (CRUD)
│   │   │
│   │   ├── warehouse/
│   │   │   ├── WarehouseImport.tsx   # ✅ Nhập kho (Form phức tạp)
│   │   │   └── WarehouseList.tsx     # ✅ Danh sách kho + thống kê
│   │   │
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── Dashboard.tsx
│   │   └── ... (các page khác)
│   │
│   ├── components/                   # Reusable Components
│   │   ├── Layout.tsx                # Main layout
│   │   ├── AuthLayout.tsx            # Auth page layout
│   │   ├── ProtectedRoute.tsx        # Route guard
│   │   ├── admin/                    # Admin components
│   │   └── warehouse/                # Warehouse components
│   │
│   ├── store/                        # Redux Store
│   │   ├── store.ts                  # Store configuration
│   │   └── slices/
│   │       ├── userSlice.ts          # User state management
│   │       ├── rulesSlice.ts         # Rules state management
│   │       └── warehouseSlice.ts     # Warehouse state management
│   │
│   ├── context/                      # Context API
│   │   ├── AuthContext.tsx           # Authentication context
│   │   └── StoreContext.tsx          # Store context
│   │
│   ├── hooks/                        # Custom Hooks
│   │   └── usePermissions.ts
│   │
│   ├── utils/                        # Utilities
│   │   └── time.ts
│   │
│   ├── types.ts                      # TypeScript types
│   ├── App.tsx                       # Main app component
│   └── main.tsx                      # Entry point
│
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🎯 Các Màn Hình & Chức Năng Đã Hoàn Thiện

### **1. User Management (Quản Lý Người Dùng)**
📍 URL: `/admin/users` (Admin only)

**Chức năng:**
- ✅ Hiển thị danh sách người dùng (Table)
- ✅ Tìm kiếm theo username/email
- ✅ Thêm người dùng mới (Modal form)
- ✅ Sửa thông tin người dùng
- ✅ Xóa người dùng (có xác nhận)
- ✅ Phân quyền (Admin, Staff, User)
- ✅ Bật/tắt trạng thái người dùng

**UI Features:**
- Table với pagination, search, sort
- Modal form với validation
- Tag để hiển thị vai trò (color-coded)
- Success/Error messages

---

### **2. Rules Configuration (Cấu Hình Quy Định)**
📍 URL: `/admin/rules` (Admin only)

**Chức năng:**
- ✅ CRUD quy định hệ thống
- ✅ Cấu hình: Max mượn sách, Ngày mượn, Phí trễ hạn
- ✅ Tìm kiếm theo tên quy định
- ✅ Enable/Disable quy định

**UI Features:**
- Table với các cột linh hoạt
- Modal form với InputNumber fields
- Mô tả chi tiết (TextArea)
- Tag status (Hoạt động/Vô hiệu)

---

### **3. Warehouse Import (Nhập Kho)**
📍 URL: `/warehouse/import`

**Chức năng:**
- ✅ Form phức tạp nhập kho:
  - Chọn ngày nhập (DatePicker)
  - Nhà cung cấp
  - Ghi chú
  
- ✅ Thêm chi tiết nhập kho:
  - AutoComplete chọn sách
  - Nhập số lượng
  - Nhà cung cấp chi tiết
  
- ✅ Bảng items với xóa
- ✅ Nút Lưu phiếu nhập / Xóa toàn bộ

**UI Features:**
- Responsive form (Row/Col grid)
- Card layout cho chi tiết
- Table inline
- Loading state khi submit
- Success/Error toast messages

---

### **4. Warehouse List (Danh Sách Kho)**
📍 URL: `/warehouse/list`

**Chức năng:**
- ✅ Hiển thị danh sách kho hàng
- ✅ Thống kê kho (Cards):
  - Tổng loại sách
  - Tổng số lượng
  - Cảnh báo tồn kho thấp
  - Giá trị kho dự tính
  
- ✅ Tìm kiếm theo tên/mã sách
- ✅ Cập nhật số lượng, tồn kho tối thiểu, vị trí
- ✅ Trạng thái kho (Bình thường/Cảnh báo/Tồn kho thấp)
- ✅ Xuất CSV

**UI Features:**
- Statistics cards với Statistic component
- Table scroll ngang (responsive)
- Color-coded status tags (Red/Orange/Green)
- Modal edit form
- CSV export functionality

---

## 🛠️ Công Nghệ Sử Dụng

### **Frontend:**
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool (⚡ Fast)
- **Redux Toolkit** - State management
- **Ant Design 5** - UI component library
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **React Router v7** - Routing

### **Backend:**
- **Node.js + Express** - Server
- **Prisma ORM** - Database
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

---

## 🔑 Tài Khoản Test

Sau khi seed dữ liệu, bạn có thể dùng:

```
Username: admin
Password: admin123

Vai trò: Admin
```

**Note:** Cần tạo API endpoints để seed users nếu chưa có.

---

## 📝 Environment Variables

### **Backend (.env)**
```env
DATABASE_URL="mysql://root:rootpassword@localhost:3307/bansach"
JWT_SECRET=bookstore_access_secret_key_2024
JWT_REFRESH_SECRET=bookstore_refresh_secret_key_2024
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### **Frontend (.env.local)** (nếu cần)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Chạy Ứng Dụng

### **Terminal 1 - Backend:**
```powershell
cd backend/bookstore-prisma
npm run dev
```

### **Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### **Truy cập ứng dụng:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Prisma Studio: `npx prisma studio` (trong thư mục backend)

---

## 🐛 Troubleshooting

### **MySQL connection error**
```
Error: connect ECONNREFUSED 127.0.0.1:3307
```
→ Kiểm tra MySQL đang chạy trên port 3307
→ Cài lại MySQL/MariaDB nếu cần

### **Prisma migrate error**
```
Error: P1000 Authentication failed
```
→ Kiểm tra DATABASE_URL trong .env
→ Đảm bảo user/password MySQL đúng

### **Port already in use**
```
Error: listen EADDRINUSE :::5000
```
→ Kill process trên port 5000: `netstat -ano | findstr :5000`
→ Hoặc thay đổi PORT trong backend

### **CORS error**
```
Access to XMLHttpRequest blocked by CORS
```
→ Kiểm tra CORS_ORIGIN trong backend .env
→ Ensure backend đang chạy

---

## 📚 Tài Liệu Tham Khảo

- [Ant Design Docs](https://ant.design/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React Router v7](https://reactrouter.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ✅ Checklist Hoàn Thành

- [x] Cấu trúc folder React
- [x] Redux setup (3 slices)
- [x] Axios instance + JWT interceptor
- [x] Ant Design + Tailwind CSS
- [x] User Management UI (CRUD)
- [x] Rules Config UI (CRUD)
- [x] Warehouse Import UI (Form phức tạp)
- [x] Warehouse List UI (Thống kê + CRUD)
- [x] API integration (user, rules, warehouse)
- [x] Responsive design
- [x] TypeScript support
- [x] Error handling & Loading states
- [x] Toast messages
- [x] Search & Filter
- [x] Export CSV

---

**Status: ✅ HOÀN THIỆN**

Ngày hoàn thành: 30/12/2025
Phiên bản: 1.0.0

---

