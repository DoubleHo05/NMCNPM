// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { UnauthorizedError } = require('../utils/errorTypes');

class AuthMiddleware {
  /**
   * Verify JWT token and attach user to request
   */
  authenticate(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('No token provided');
      }

      const token = authHeader.substring(7); // Remove 'Bearer '

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Attach user info to request
      req.user = {
        id: decoded.id,
        role: decoded.role,
        username: decoded.username
      };

      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        next(error);
      } else {
        next(new UnauthorizedError('Invalid or expired token'));
      }
    }
  }

  /**
   * Generate JWT token (for testing/development)
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        role: user.role,
        username: user.username
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  }
}

module.exports = new AuthMiddleware();