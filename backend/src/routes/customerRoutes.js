const express = require('express');
const router = express.Router();
const { authMiddleware, checkRole } = require('../middlewares/auth');
const customerController = require('../controllers/customerController');

// Routes yêu cầu đăng nhập
router.use(authMiddleware);

// Tất cả nhân viên đều có thể xem và tạo khách hàng
router.get('/', customerController.getAllCustomers);
router.get('/phone/:phone', customerController.getCustomerByPhone);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);

// Cập nhật và xóa chỉ cho THU_NGAN và QUAN_LY
router.put('/:id', checkRole('THU_NGAN', 'QUAN_LY'), customerController.updateCustomer);
router.delete('/:id', checkRole('QUAN_LY'), customerController.deleteCustomer);

module.exports = router;
