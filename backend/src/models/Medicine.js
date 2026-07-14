const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    chemist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true },
    brand: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Pain Relief',
        'Fever',
        'Cold & Flu',
        'Vitamins & Supplements',
        'Antibiotics',
        'Digestive Care',
        'Skin Care',
        'Diabetes Care',
        'Cardiac Care',
        'Other',
      ],
    },
    diseaseTags: [{ type: String, trim: true }], // for "search by disease"

    description: String,
    images: [{ url: String, publicId: String }],

    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },

    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },

    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 10 },

    requiresPrescription: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index for search-by-name/brand/generic/disease
medicineSchema.index({ name: 'text', brand: 'text', genericName: 'text', diseaseTags: 'text' });
medicineSchema.index({ chemist: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ expiryDate: 1 });
medicineSchema.index({ stockQuantity: 1 });

medicineSchema.virtual('isExpired').get(function isExpired() {
  return this.expiryDate < new Date();
});

medicineSchema.virtual('isLowStock').get(function isLowStock() {
  return this.stockQuantity > 0 && this.stockQuantity <= this.lowStockThreshold;
});

medicineSchema.virtual('isOutOfStock').get(function isOutOfStock() {
  return this.stockQuantity === 0;
});

medicineSchema.set('toJSON', { virtuals: true });
medicineSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
