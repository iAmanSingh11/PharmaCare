const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_accepted',
        'order_rejected',
        'order_dispatched',
        'order_delivered',
        'order_cancelled',
        'low_stock',
        'out_of_stock',
        'new_review',
        'payment_received',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    relatedMedicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
