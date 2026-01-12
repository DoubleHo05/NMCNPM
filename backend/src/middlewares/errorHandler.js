// middlewares/errorHandler.js
const { AppError } = require('../utils/errorTypes');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('❌ Error:', err);
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        name: err.name,
        message: err.message
      }
    });
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        name: 'ValidationError',
        message: err.message
      }
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'Invalid token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        name: 'UnauthorizedError',
        message: 'Token expired'
      }
    });
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    error: {
      name: 'InternalServerError',
      message: process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : err.message
    }
  });
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err, res) => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      return res.status(409).json({
        success: false,
        error: {
          name: 'ConflictError',
          message: 'A record with this data already exists'
        }
      });

    case 'P2025':
      // Record not found
      return res.status(404).json({
        success: false,
        error: {
          name: 'NotFoundError',
          message: 'Record not found'
        }
      });

    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json({
        success: false,
        error: {
          name: 'ValidationError',
          message: 'Invalid reference to related record'
        }
      });

    default:
      return res.status(500).json({
        success: false,
        error: {
          name: 'DatabaseError',
          message: 'Database operation failed'
        }
      });
  }
};

module.exports = errorHandler;