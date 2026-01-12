// middlewares/roleMiddleware.js
const { ForbiddenError } = require('../utils/errorTypes');

class RoleMiddleware {
  /**
   * Check if user has required role
   * @param {Array<string>} allowedRoles - Array of allowed roles
   */
  checkRole(allowedRoles) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw new ForbiddenError('User not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
          throw new ForbiddenError(
            `Access denied. Required roles: ${allowedRoles.join(', ')}`
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if user is admin/manager
   */
  isAdmin(req, res, next) {
    return this.checkRole(['QUAN_LY'])(req, res, next);
  }

  /**
   * Check if user is cashier or admin
   */
  isCashier(req, res, next) {
    return this.checkRole(['THU_NGAN', 'QUAN_LY'])(req, res, next);
  }
}

module.exports = new RoleMiddleware();