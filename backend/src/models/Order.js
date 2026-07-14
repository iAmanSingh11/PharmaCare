const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    name: { type: String, required: true }, // snapshot at time of order
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // snapshot selling price
  },
  { _id: false }
);

const timelineEventSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    chemist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],

    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },

    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
    },
    timeline: [timelineEventSchema],

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, enum: ['cod', 'razorpay'], default: 'cod' },

    // Populated only for paymentMethod: 'razorpay', after signature verification
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    invoiceUrl: String,
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ chemist: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
