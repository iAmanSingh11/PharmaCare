const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

// @route   GET /api/admin/overview
const getOverview = asyncHandler(async (req, res) => {
  const [totalCustomers, totalChemists, totalOrders, totalMedicines, pendingVerifications] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'chemist' }),
    Order.countDocuments(),
    Medicine.countDocuments(),
    User.countDocuments({ role: 'chemist', 'shopDetails.isVerified': false }),
  ]);

  res.status(200).json({
    success: true,
    data: { totalCustomers, totalChemists, totalOrders, totalMedicines, pendingVerifications },
  });
});

// @route   GET /api/admin/users?role=chemist
const getUsers = asyncHandler(async (req, res) => {
  const baseQuery = User.find({}).select('-password -refreshTokens');
  const features = new ApiFeatures(baseQuery, req.query).filter(['role']).sort('-createdAt').paginate();

  const [users, total] = await Promise.all([features.query, User.countDocuments()]);
  res.status(200).json({ success: true, data: users, pagination: { ...features.pagination, total } });
});

// @route   PATCH /api/admin/users/:id/verify
// @desc    Verifies a chemist's license/GST details so their shop is publicly trusted
const verifyChemist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'chemist') throw new ApiError(404, 'Chemist not found');

  user.shopDetails.isVerified = true;
  await user.save();

  res.status(200).json({ success: true, message: 'Chemist verified', data: user.toSafeObject() });
});

// @route   PATCH /api/admin/users/:id/toggle-active
const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: user.isActive ? 'User reactivated' : 'User deactivated',
    data: user.toSafeObject(),
  });
});

module.exports = { getOverview, getUsers, verifyChemist, toggleUserActive };
