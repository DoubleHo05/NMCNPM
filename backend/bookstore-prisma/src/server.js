require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRoutes = require('./routes/bookRoutes');
const customerRoutes = require('./routes/customerRoutes');
const rulesRoutes = require('./routes/rulesRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const importRoutes = require('./routes/importRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const statsRoutes = require('./routes/statsRoutes');
const publisherRoutes = require('./routes/publisherRoutes');
const authorRoutes = require('./routes/authorRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({
    message: 'Bookstore API - Hệ thống Quản lý Nhà sách',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      books: '/api/books',
      customers: '/api/customers',
      rules: '/api/rules',
      inventory: '/api/inventory',
      settings: '/api/settings',
      imports: '/api/imports',
      invoices: '/api/invoices',
      categories: '/api/categories',
      payments: '/api/payments',
      stats: '/api/stats',
      publishers: '/api/publishers',
      authors: '/api/authors',
      chat: '/api/chat',
    },
  });
});

// Register all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/imports', importRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/chat', chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy đường dẫn',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi server',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📚 Bookstore Management System API`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
