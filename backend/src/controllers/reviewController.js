const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

/** Recomputes and stores the average rating for a medicine after a review changes. */
const refreshMedicineRating = async (medicineId) => {
  const stats = await Review.aggregate([
    { $match: { medicine: medicineId } },
    { $group: { _id: '$medicine', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Medicine.findByIdAndUpdate(medicineId, {
    ratingsAverage: stats[0]?.avg || 0,
    ratingsCount: stats[0]?.count || 0,
  });
};

// @route   POST /api/reviews
// @desc    Customer reviews a medicine/chemist from a delivered order (one review per order)
const createReview = asyncHandler(async (req, res) => {
  const { orderId, medicineId, rating, comment } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (String(order.customer) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only review your own orders');
  }
  if (order.status !== 'delivered') {
    throw new ApiError(400, 'You can only review orders that have been delivered');
  }
  if (medicineId && !order.items.some((i) => String(i.medicine) === medicineId)) {
    throw new ApiError(400, 'That medicine is not part of this order');
  }

  const review = await Review.create({
    customer: req.user._id,
    order: orderId,
    medicine: medicineId || undefined,
    chemist: order.chemist,
    rating,
    comment,
  });

  if (medicineId) await refreshMedicineRating(medicineId);

  await Notification.create({
    user: order.chemist,
    type: 'new_review',
    title: 'New review received',
    message: `A customer left a ${rating}-star review on order ${order.orderNumber}.`,
    relatedOrder: order._id,
  });

  res.status(201).json({ success: true, message: 'Review submitted', data: review });
});

// @route   GET /api/reviews/medicine/:medicineId
const getMedicineReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ medicine: req.params.medicineId })
    .populate('customer', 'name')
    .sort('-createdAt');
  res.status(200).json({ success: true, data: reviews });
});

// @route   GET /api/reviews/chemist/:chemistId
const getChemistReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ chemist: req.params.chemistId })
    .populate('customer', 'name')
    .sort('-createdAt');
  res.status(200).json({ success: true, data: reviews });
});

// @route   GET /api/reviews/reviewable/:orderId
// @desc    Tells the frontend whether this order still needs a review (avoids duplicate submissions)
const getReviewableStatus = asyncHandler(async (req, res) => {
  const existing = await Review.findOne({ order: req.params.orderId, customer: req.user._id });
  res.status(200).json({ success: true, data: { alreadyReviewed: Boolean(existing) } });
});

module.exports = { createReview, getMedicineReviews, getChemistReviews, getReviewableStatus };
