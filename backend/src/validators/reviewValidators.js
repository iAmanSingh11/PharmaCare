const { body } = require('express-validator');

const reviewValidator = [
  body('orderId').notEmpty().withMessage('orderId is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be under 500 characters'),
];

module.exports = { reviewValidator };
