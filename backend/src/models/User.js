const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    lat: Number,
    lng: Number,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'chemist', 'admin'],
      required: true,
      default: 'customer',
    },
    avatar: {
      url: String,
      publicId: String,
    },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Customer only 
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
    favoriteShops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Chemist only 
    shopDetails: {
      shopName: String,
      licenseNumber: String,
      gstNumber: String,
      shopAddress: addressSchema,
      openingHours: {
        open: String,
        close: String,
        daysClosed: [String],
      },
      isVerified: { type: Boolean, default: false },
    },

    // Auth helper fields
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshTokens: [{ type: String }], // supports multiple active sessions/devices
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });
userSchema.index({ 'shopDetails.shopAddress.lat': 1, 'shopDetails.shopAddress.lng': 1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.emailVerificationToken;
  delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
