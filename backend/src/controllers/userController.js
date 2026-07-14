const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { uploadBufferToCloudinary } = require('../config/cloudinary');

// @route   PATCH /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  if (req.user.role === 'chemist' && req.body.shopDetails) {
    req.user.shopDetails = { ...req.user.shopDetails.toObject(), ...req.body.shopDetails };
  }

  if (req.file) {
    const result = await uploadBufferToCloudinary(req.file.buffer, 'pharmacare/avatars');
    req.user.avatar = result;
  }

  await req.user.save();
  res.status(200).json({ success: true, message: 'Profile updated', data: req.user.toSafeObject() });
});

// @route   POST /api/users/addresses
const addAddress = asyncHandler(async (req, res) => {
  if (req.user.role !== 'customer') throw new ApiError(403, 'Only customers can manage addresses');
  req.user.addresses.push(req.body);
  await req.user.save();
  res.status(201).json({ success: true, data: req.user.addresses });
});

// @route   DELETE /api/users/addresses/:addressId
const deleteAddress = asyncHandler(async (req, res) => {
  req.user.addresses = req.user.addresses.filter((a) => String(a._id) !== req.params.addressId);
  await req.user.save();
  res.status(200).json({ success: true, data: req.user.addresses });
});

// @route   GET /api/users/chemists/nearby?lat=..&lng=..&radiusKm=10
// @desc    Public endpoint, lists verified chemist shops sorted by distance.
//          Uses a simple haversine calculation in application code; for
//          larger catalogs, replace with a Mongo 2dsphere geo index.
const getNearbyChemists = asyncHandler(async (req, res) => {
  const { lat, lng, radiusKm = 10 } = req.query;

  const chemists = await User.find({ role: 'chemist', isActive: true }).select(
    'name shopDetails phone'
  );

  const toRad = (deg) => (deg * Math.PI) / 180;
  const haversineKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const withDistance = chemists
    .map((c) => {
      const shopLat = c.shopDetails?.shopAddress?.lat;
      const shopLng = c.shopDetails?.shopAddress?.lng;
      const distanceKm =
        lat && lng && shopLat && shopLng
          ? haversineKm(Number(lat), Number(lng), shopLat, shopLng)
          : null;
      return { ...c.toObject(), distanceKm };
    })
    .filter((c) => c.distanceKm === null || c.distanceKm <= Number(radiusKm))
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  res.status(200).json({ success: true, data: withDistance });
});

// @route   POST /api/users/wishlist/:medicineId
const toggleWishlist = asyncHandler(async (req, res) => {
  if (req.user.role !== 'customer') throw new ApiError(403, 'Only customers have a wishlist');
  const { medicineId } = req.params;
  const exists = req.user.wishlist.some((id) => String(id) === medicineId);

  if (exists) {
    req.user.wishlist = req.user.wishlist.filter((id) => String(id) !== medicineId);
  } else {
    req.user.wishlist.push(medicineId);
  }
  await req.user.save();

  res.status(200).json({ success: true, wishlisted: !exists, data: req.user.wishlist });
});

// @route   GET /api/users/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await req.user.populate({
    path: 'wishlist',
    populate: { path: 'chemist', select: 'name shopDetails.shopName' },
  });
  res.status(200).json({ success: true, data: user.wishlist });
});

// @route   POST /api/users/favorites/:chemistId
const toggleFavoriteShop = asyncHandler(async (req, res) => {
  if (req.user.role !== 'customer') throw new ApiError(403, 'Only customers can favorite pharmacies');
  const { chemistId } = req.params;
  const exists = req.user.favoriteShops.some((id) => String(id) === chemistId);

  if (exists) {
    req.user.favoriteShops = req.user.favoriteShops.filter((id) => String(id) !== chemistId);
  } else {
    req.user.favoriteShops.push(chemistId);
  }
  await req.user.save();

  res.status(200).json({ success: true, favorited: !exists, data: req.user.favoriteShops });
});

module.exports = {
  updateProfile,
  addAddress,
  deleteAddress,
  getNearbyChemists,
  toggleWishlist,
  getWishlist,
  toggleFavoriteShop,
};
