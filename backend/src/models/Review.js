const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    chemist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ medicine: 1 });
reviewSchema.index({ chemist: 1 });
reviewSchema.index({ customer: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
