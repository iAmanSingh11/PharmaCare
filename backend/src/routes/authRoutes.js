const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  registerCustomer,
  registerChemist,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  registerCustomerValidator,
  registerChemistValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} = require('../validators/authValidators');

const router = express.Router();

// Tighter limiter specifically for auth endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post('/register/customer', authLimiter, registerCustomerValidator, validate, registerCustomer);
router.post('/register/chemist', authLimiter, registerChemistValidator, validate, registerChemist);
router.post('/verify-email', authLimiter, verifyEmailValidator, validate, verifyEmail);
router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
