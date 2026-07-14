const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const { notifyUser } = require('../socket');
const { streamInvoicePdf } = require('../utils/invoicePdf');
const { verifyRazorpaySignature } = require('./paymentController');

const generateOrderNumber = () => `ORD${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

// @route   POST /api/orders
// @desc    Customer places an order from a list of { medicineId, quantity }
const placeOrder = asyncHandler(async (req, res) => {
  const {
    items,
    deliveryAddress,
    paymentMethod,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  } = req.body;

  if (!items?.length) throw new ApiError(400, 'Order must contain at least one item');

  // For online payments, the signature MUST verify server side before we ever mark an order as paid, the client's word alone is never trusted.
  let paymentStatus = 'pending';
  if (paymentMethod === 'razorpay') {
    const verified = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (!verified) {
      throw new ApiError(400, 'Payment verification failed. Please try again or use Cash on Delivery.');
    }
    paymentStatus = 'paid';
  }

  const medicineIds = items.map((i) => i.medicineId);
  const medicines = await Medicine.find({ _id: { $in: medicineIds } });

  if (medicines.length !== items.length) {
    throw new ApiError(400, 'One or more medicines in the order could not be found');
  }

  // All items in a single order must come from the same chemist (one shop per order)
  const chemistId = String(medicines[0].chemist);
  if (!medicines.every((m) => String(m.chemist) === chemistId)) {
    throw new ApiError(400, 'All items in one order must be from the same pharmacy');
  }

  let subtotal = 0;
  const orderItems = items.map(({ medicineId, quantity }) => {
    const medicine = medicines.find((m) => String(m._id) === medicineId);
    if (medicine.stockQuantity < quantity) {
      throw new ApiError(400, `${medicine.name} only has ${medicine.stockQuantity} units in stock`);
    }
    subtotal += medicine.sellingPrice * quantity;
    return {
      medicine: medicine._id,
      name: medicine.name,
      quantity,
      price: medicine.sellingPrice,
    };
  });

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    customer: req.user._id,
    chemist: chemistId,
    items: orderItems,
    deliveryAddress,
    subtotal,
    total: subtotal,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus,
    ...(paymentMethod === 'razorpay' && { razorpayOrderId, razorpayPaymentId, razorpaySignature }),
    timeline: [{ status: 'pending', note: 'Order placed' }],
  });

  await Notification.create({
    user: chemistId,
    type: 'order_placed',
    title: 'New order received',
    message: `Order ${order.orderNumber} was just placed.`,
    relatedOrder: order._id,
  });
  notifyUser(chemistId, 'order:new', { orderId: order._id, orderNumber: order.orderNumber });

  res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
});

// @route   GET /api/orders/mine
// @desc    Customer's own order history
const getMyOrders = asyncHandler(async (req, res) => {
  const baseQuery = Order.find({ customer: req.user._id }).populate('chemist', 'name shopDetails.shopName');
  const features = new ApiFeatures(baseQuery, req.query).filter(['status']).sort('-createdAt').paginate();

  const [orders, total] = await Promise.all([
    features.query,
    Order.countDocuments({ customer: req.user._id }),
  ]);

  res.status(200).json({ success: true, data: orders, pagination: { ...features.pagination, total } });
});

// @route   GET /api/orders/shop
// @desc    Chemist's incoming orders
const getShopOrders = asyncHandler(async (req, res) => {
  const baseQuery = Order.find({ chemist: req.user._id }).populate('customer', 'name phone');
  const features = new ApiFeatures(baseQuery, req.query).filter(['status']).sort('-createdAt').paginate();

  const [orders, total] = await Promise.all([
    features.query,
    Order.countDocuments({ chemist: req.user._id }),
  ]);

  res.status(200).json({ success: true, data: orders, pagination: { ...features.pagination, total } });
});

// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name phone')
    .populate('chemist', 'name shopDetails.shopName');
  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = String(order.customer._id) === String(req.user._id);
  const isChemist = String(order.chemist._id) === String(req.user._id);
  if (!isOwner && !isChemist) throw new ApiError(403, 'You do not have access to this order');

  res.status(200).json({ success: true, data: order });
});

const STATUS_NOTIFICATION_MAP = {
  accepted: { type: 'order_accepted', title: 'Order accepted', message: 'has been accepted and is being prepared.' },
  rejected: { type: 'order_rejected', title: 'Order rejected', message: 'was rejected by the pharmacy.' },
  dispatched: { type: 'order_dispatched', title: 'Order dispatched', message: 'is on its way to you.' },
  delivered: { type: 'order_delivered', title: 'Order delivered', message: 'has been delivered. Enjoy!' },
  cancelled: { type: 'order_cancelled', title: 'Order cancelled', message: 'has been cancelled.' },
};

// @route   PATCH /api/orders/:id/status
// @desc    Chemist transitions order status; stock is decremented on acceptance
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = Object.keys(STATUS_NOTIFICATION_MAP).concat('pending');
  if (!validStatuses.includes(status)) throw new ApiError(400, 'Invalid order status');

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (String(order.chemist) !== String(req.user._id)) {
    throw new ApiError(403, 'Only the fulfilling pharmacy can update this order');
  }

  // Reduce stock exactly once, at the moment an order is accepted
  if (status === 'accepted' && order.status === 'pending') {
    for (const item of order.items) {
      const medicine = await Medicine.findById(item.medicine);
      if (medicine) {
        medicine.stockQuantity = Math.max(0, medicine.stockQuantity - item.quantity);
        await medicine.save();
      }
    }
  }

  order.status = status;
  order.timeline.push({ status, note });
  await order.save();

  const notif = STATUS_NOTIFICATION_MAP[status];
  if (notif) {
    await Notification.create({
      user: order.customer,
      type: notif.type,
      title: notif.title,
      message: `Order ${order.orderNumber} ${notif.message}`,
      relatedOrder: order._id,
    });
    notifyUser(order.customer, 'order:status', { orderId: order._id, status });
  }

  res.status(200).json({ success: true, message: 'Order status updated', data: order });
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Customer cancels their own order, only while it's still pending
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');
  if (String(order.customer) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only cancel your own orders');
  }
  if (order.status !== 'pending') {
    throw new ApiError(400, 'Only pending orders can be cancelled. Contact the pharmacy for accepted orders.');
  }

  order.status = 'cancelled';
  order.timeline.push({ status: 'cancelled', note: 'Cancelled by customer' });
  await order.save();

  await Notification.create({
    user: order.chemist,
    type: 'order_cancelled',
    title: 'Order cancelled',
    message: `Order ${order.orderNumber} was cancelled by the customer.`,
    relatedOrder: order._id,
  });
  notifyUser(order.chemist, 'order:status', { orderId: order._id, status: 'cancelled' });

  res.status(200).json({ success: true, message: 'Order cancelled', data: order });
});

// @route   GET /api/orders/customers
// @desc    Chemist's customer list, aggregated from their order history
const getShopCustomers = asyncHandler(async (req, res) => {
  const customers = await Order.aggregate([
    { $match: { chemist: req.user._id } },
    {
      $group: {
        _id: '$customer',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$total', 0] } },
        lastOrderAt: { $max: '$createdAt' },
      },
    },
    { $sort: { lastOrderAt: -1 } },
    {
      $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'customer' },
    },
    { $unwind: '$customer' },
    {
      $project: {
        _id: 0,
        customerId: '$customer._id',
        name: '$customer.name',
        phone: '$customer.phone',
        email: '$customer.email',
        totalOrders: 1,
        totalSpent: 1,
        lastOrderAt: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: customers });
});

// @route   GET /api/orders/:id/invoice
// @desc    Streams a PDF invoice for the order (customer or fulfilling chemist only)
const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name phone')
    .populate('chemist', 'name shopDetails.shopName');
  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = String(order.customer._id) === String(req.user._id);
  const isChemist = String(order.chemist._id) === String(req.user._id);
  if (!isOwner && !isChemist) throw new ApiError(403, 'You do not have access to this order');

  streamInvoicePdf(order, res);
});

module.exports = {
  placeOrder,
  getMyOrders,
  getShopOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getShopCustomers,
  downloadInvoice,
};
