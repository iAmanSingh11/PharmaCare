const ApiError = require('../utils/ApiError');

/*
 * Restricts a route to specific roles. Use after `protect`.
 * Example: router.post('/medicines', protect, authorize('chemist'), createMedicine)
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authorized.');
  }
  if (!allowedRoles.includes(req.user.role)) {
    throw new ApiError(403, `Role "${req.user.role}" is not permitted to access this resource.`);
  }
  next();
};

module.exports = { authorize };
