# 🚀 Quick Start Guide - Bookstore Backend

## 📋 Prerequisites

- Node.js >= 18.0.0
- MySQL 8.0
- npm >= 9.0.0

---

## ⚡ Quick Setup (5 minutes)

### 1️⃣ Clone & Install

```bash
cd backend
npm install
```

### 2️⃣ Setup Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

**Minimum .env configuration:**

```env
NODE_ENV=development
PORT=8000
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/bookstore"
JWT_SECRET=change-this-to-random-string
```

### 3️⃣ Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations to create tables
npm run prisma:migrate

# (Optional) Seed initial data
npm run prisma:seed
```

### 4️⃣ Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

**Expected output:**

```
🚀 Server running on port 8000
📝 Environment: development
🔗 API: http://localhost:8000
💚 Health: http://localhost:8000/api/health
```

---

## 🧪 Verify Installation

### Test Health Endpoint

```bash
curl http://localhost:8000/api/health
```

**Expected response:**

```json
{
  "success": true,
  "status": "healthy",
  "uptime": 12.345,
  "timestamp": "2024-12-24T10:00:00.000Z"
}
```

### Run Tests

```bash
npm test
```

**Expected:** All 23 tests pass ✅

---

## 🔑 Get Test JWT Token

For testing API endpoints, you need a JWT token:

```bash
# Create a test token (Node.js console)
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: 1, role: 'THU_NGAN', username: 'test' },
  'your-super-secret-jwt-key-change-this-in-production',
  { expiresIn: '24h' }
);
console.log('Bearer ' + token);
"
```

Copy the token and use it in API requests:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:8000/api/sales/invoices
```

---

## 📝 Test API with Postman

### Create Invoice (POST /api/sales/invoices)

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": 1,
  "items": [
    {
      "isbn": "978-0-13-468599-1",
      "quantity": 2,
      "unitPrice": 80000
    }
  ],
  "discount": 0
}
```

### Create Payment (POST /api/payments)

**Body:**
```json
{
  "customerId": 1,
  "amount": 30000,
  "paymentMethod": "TIEN_MAT",
  "invoiceId": 1
}
```

---

## 🐛 Common Issues

### Issue 1: Cannot find module 'D:\...\app.js'

**Fix:** Đảm bảo file `src/app.js` tồn tại.

```bash
ls -la src/app.js
```

### Issue 2: Prisma Client not generated

**Fix:**

```bash
npm run prisma:generate
```

### Issue 3: Database connection failed

**Fix:** Check `.env` DATABASE_URL và đảm bảo MySQL đang chạy:

```bash
# Windows
net start MySQL80

# Linux/Mac
sudo service mysql start
```

### Issue 4: Port 8000 already in use

**Fix:** Change PORT in `.env`:

```env
PORT=8001
```

---

## 📂 Project Structure

```
backend/
├── src/
│   ├── app.js              ← Server entry point
│   ├── services/           ← Business logic
│   │   ├── salesService.js
│   │   └── paymentService.js
│   ├── controllers/        ← Request handlers
│   ├── routes/             ← API routes
│   ├── middlewares/        ← Express middlewares
│   └── utils/              ← Helpers
├── prisma/
│   ├── schema.prisma       ← Database schema
│   └── migrations/         ← Migration files
├── tests/                  ← Unit & integration tests
├── .env                    ← Environment variables (create this)
├── package.json
└── README.md
```

---

## 🎯 Next Steps

1. ✅ **Database**: Create seed data (customers, books, employees)
2. ✅ **Testing**: Run `npm test` to verify all tests pass
3. ✅ **API**: Test endpoints with Postman/Thunder Client
4. ✅ **Frontend**: Connect React frontend to backend
5. ✅ **Deploy**: Deploy to production server

---

## 📚 Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm test                    # Run all tests
npm run test:watch          # Watch mode

# Database
npm run prisma:studio       # Open Prisma Studio (GUI)
npm run prisma:migrate      # Run migrations
npm run prisma:seed         # Seed data

# Code Quality
npm run lint                # Check code style
npm run lint:fix            # Fix code style
npm run format              # Format code with Prettier
```

---

## 🆘 Need Help?

- 📖 [Full Documentation](./README.md)
- 🧪 [Testing Guide](./TESTING_GUIDE.md)
- 🐛 [GitHub Issues](https://github.com/your-repo/issues)
