const { body } = require('express-validator');

const registerCustomerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').trim().isLength({ min: 10, max: 15 }).withMessage('Enter a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const registerChemistValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').trim().isLength({ min: 10, max: 15 }).withMessage('Enter a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('shopName').trim().notEmpty().withMessage('Shop name is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('gstNumber').trim().notEmpty().withMessage('GST number is required'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const verifyEmailValidator = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

module.exports = {
  registerCustomerValidator,
  registerChemistValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
};
