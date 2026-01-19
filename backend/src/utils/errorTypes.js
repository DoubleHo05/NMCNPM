// utils/errorTypes.js

/**
 * Base class cho tất cả custom errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Phân biệt lỗi operational vs programming error
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Lỗi validation dữ liệu đầu vào
 * HTTP Status: 400 Bad Request
 */
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

/**
 * Lỗi vi phạm quy tắc nghiệp vụ
 * HTTP Status: 422 Unprocessable Entity
 */
class BusinessRuleError extends AppError {
  constructor(message) {
    super(message, 422);
    this.name = 'BusinessRuleError';
  }
}

/**
 * Lỗi không tìm thấy tài nguyên
 * HTTP Status: 404 Not Found
 */
class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Lỗi không đủ quyền truy cập
 * HTTP Status: 403 Forbidden
 */
class ForbiddenError extends AppError {
  constructor(message = 'Bạn không có quyền thực hiện thao tác này') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Lỗi xác thực (authentication)
 * HTTP Status: 401 Unauthorized
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Vui lòng đăng nhập để tiếp tục') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Lỗi không đủ tồn kho
 * HTTP Status: 422
 */
class InsufficientStockError extends BusinessRuleError {
  constructor(message) {
    super(message);
    this.name = 'InsufficientStockError';
  }
}

/**
 * Lỗi vượt quá giới hạn nợ
 * HTTP Status: 422
 */
class DebtLimitExceededError extends BusinessRuleError {
  constructor(message) {
    super(message);
    this.name = 'DebtLimitExceededError';
  }
}

/**
 * Lỗi thanh toán vượt quá số nợ
 * HTTP Status: 422
 */
class PaymentExceedDebtError extends BusinessRuleError {
  constructor(message) {
    super(message);
    this.name = 'PaymentExceedDebtError';
  }
}

/**
 * Lỗi conflict dữ liệu (duplicate, race condition...)
 * HTTP Status: 409 Conflict
 */
class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Lỗi database hoặc hệ thống
 * HTTP Status: 500 Internal Server Error
 */
class DatabaseError extends AppError {
  constructor(message = 'Lỗi kết nối cơ sở dữ liệu') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

module.exports = {
  AppError,
  ValidationError,
  BusinessRuleError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  InsufficientStockError,
  DebtLimitExceededError,
  PaymentExceedDebtError,
  ConflictError,
  DatabaseError
};