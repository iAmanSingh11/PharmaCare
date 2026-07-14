const express = require('express');
const { body } = require('express-validator');
const { getPaymentConfig, createRazorpayOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.get('/config', getPaymentConfig);

router.post(
  '/razorpay/order',
  protect,
  authorize('customer'),
  [body('amount').isFloat({ gt: 0 }).withMessage('A valid amount is required')],
  validate,
  createRazorpayOrder
);

module.exports = router;
