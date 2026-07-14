const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @route   GET /api/notifications
const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.status(200).json({ success: true, data: notifications, unreadCount });
});

// @route   PATCH /api/notifications/:id/read
const markAsRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { isRead: true });
  res.status(200).json({ success: true, message: 'Notification marked as read' });
});

// @route   PATCH /api/notifications/read all
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
