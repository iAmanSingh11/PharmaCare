const express = require('express');
const { body } = require('express-validator');
const {
  placeOrder,
  getMyOrders,
  getShopOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getShopCustomers,
  downloadInvoice,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('customer'),
  [body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item')],
  validate,
  placeOrder
);
router.get('/mine', authorize('customer'), getMyOrders);
router.get('/shop', authorize('chemist'), getShopOrders);
router.get('/customers', authorize('chemist'), getShopCustomers);
router.get('/:id', getOrderById);
router.get('/:id/invoice', downloadInvoice);
router.patch('/:id/cancel', authorize('customer'), cancelOrder);
router.patch(
  '/:id/status',
  authorize('chemist'),
  [body('status').notEmpty().withMessage('Status is required')],
  validate,
  updateOrderStatus
);

module.exports = router;
