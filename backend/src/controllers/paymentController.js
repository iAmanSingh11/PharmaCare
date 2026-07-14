const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const { getClient, isConfigured } = require('../config/razorpay');

// @route   GET /api/payments/config
// @desc    frontend know whether Razorpay is configured and what
//          public key to use, without exposing the secret.
const getPaymentConfig = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { configured: isConfigured(), keyId: isConfigured() ? process.env.RAZORPAY_KEY_ID : null },
  });
});

// @route   POST /api/payments/razorpay/order
// @desc    Creates a Razorpay order for the given amount (in rupees). The
//          returned order id is what the frontend passes into Razorpay's
//          Checkout widget to open the payment modal.
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!isConfigured()) {
    throw new ApiError(503, 'Online payments are not configured yet. Please use Cash on Delivery.');
  }
  if (!amount || amount <= 0) {
    throw new ApiError(400, 'A valid amount is required');
  }

  const client = getClient();
  const order = await client.orders.create({
    amount: Math.round(amount * 100), // Razorpay expects lower value (paisa in our case)
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
  });

  res.status(201).json({
    success: true,
    data: { orderId: order.id, amount: order.amount, currency: order.currency, keyId: process.env.RAZORPAY_KEY_ID },
  });
});

/*
 * Verifies a Razorpay checkout callback's signature using HMAC-SHA256,
   per Razorpay's documented verification scheme. Used by orderController before
   it will mark an order as paid. never trust the client's word alone.
 */
const verifyRazorpaySignature = ({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  if (!isConfigured()) return false;
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) return false;

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return expected === razorpaySignature;
};

module.exports = { getPaymentConfig, createRazorpayOrder, verifyRazorpaySignature };
