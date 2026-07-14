const { body } = require('express-validator');

const medicineValidator = [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('batchNumber').trim().notEmpty().withMessage('Batch number is required'),
  body('expiryDate').isISO8601().withMessage('Enter a valid expiry date'),
  body('mrp').isFloat({ min: 0 }).withMessage('MRP must be a positive number'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
];

module.exports = { medicineValidator };
