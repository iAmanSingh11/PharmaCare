const asyncHandler = require('express-async-handler');
const Medicine = require('../models/Medicine');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');
const { uploadBufferToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// @route   GET /api/medicines
// @desc    Public/customer facing catalog search...searchable, filterable, paginated
const getMedicines = asyncHandler(async (req, res) => {
  const baseQuery = Medicine.find({ isActive: true, stockQuantity: { $gt: 0 } }).populate(
    'chemist',
    'name shopDetails.shopName shopDetails.shopAddress'
  );

  const features = new ApiFeatures(baseQuery, req.query)
    .search()
    .filter(['category'])
    .sort('-createdAt')
    .limitFields()
    .paginate();

  const [medicines, total] = await Promise.all([
    features.query,
    Medicine.countDocuments({ isActive: true, stockQuantity: { $gt: 0 } }),
  ]);

  res.status(200).json({
    success: true,
    data: medicines,
    pagination: { ...features.pagination, total },
  });
});

// @route   GET /api/medicines/:id
const getMedicineById = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id).populate(
    'chemist',
    'name shopDetails.shopName shopDetails.shopAddress'
  );
  if (!medicine) throw new ApiError(404, 'Medicine not found');
  res.status(200).json({ success: true, data: medicine });
});

// @route   GET /api/medicines/inventory/mine
// @desc    Chemist's own inventory (includes out of stock/expired, for management)
const getMyInventory = asyncHandler(async (req, res) => {
  const baseQuery = Medicine.find({ chemist: req.user._id });

  const features = new ApiFeatures(baseQuery, req.query)
    .search()
    .filter(['category'])
    .sort('-createdAt')
    .paginate();

  const [medicines, total] = await Promise.all([
    features.query,
    Medicine.countDocuments({ chemist: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    data: medicines,
    pagination: { ...features.pagination, total },
  });
});

// @route   POST /api/medicines
// @desc    Chemist adds a new medicine (with optional images via multer -> Cloudinary)
const createMedicine = asyncHandler(async (req, res) => {
  const images = [];
  if (req.files?.length) {
    for (const file of req.files) {
      const result = await uploadBufferToCloudinary(file.buffer);
      images.push(result);
    }
  }

  const medicine = await Medicine.create({
    ...req.body,
    chemist: req.user._id,
    images,
  });

  res.status(201).json({ success: true, message: 'Medicine added to inventory', data: medicine });
});

// @route   PATCH /api/medicines/:id
const updateMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw new ApiError(404, 'Medicine not found');
  if (String(medicine.chemist) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only edit medicines in your own inventory');
  }

  if (req.files?.length) {
    for (const file of req.files) {
      const result = await uploadBufferToCloudinary(file.buffer);
      medicine.images.push(result);
    }
  }

  Object.assign(medicine, req.body);
  await medicine.save();

  // Fire low stock / out of stock alerts when relevant
  if (medicine.isOutOfStock) {
    await Notification.create({
      user: req.user._id,
      type: 'out_of_stock',
      title: 'Out of stock',
      message: `${medicine.name} is now out of stock.`,
      relatedMedicine: medicine._id,
    });
  } else if (medicine.isLowStock) {
    await Notification.create({
      user: req.user._id,
      type: 'low_stock',
      title: 'Low stock alert',
      message: `${medicine.name} is running low (${medicine.stockQuantity} left).`,
      relatedMedicine: medicine._id,
    });
  }

  res.status(200).json({ success: true, message: 'Medicine updated', data: medicine });
});

// @route   DELETE /api/medicines/:id
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) throw new ApiError(404, 'Medicine not found');
  if (String(medicine.chemist) !== String(req.user._id)) {
    throw new ApiError(403, 'You can only delete medicines in your own inventory');
  }

  await Promise.all(medicine.images.map((img) => deleteFromCloudinary(img.publicId)));
  await medicine.deleteOne();

  res.status(200).json({ success: true, message: 'Medicine removed from inventory' });
});

// @route   GET /api/medicines/analytics/summary
// @desc    Powers the chemist dashboard stat cards
const getInventorySummary = asyncHandler(async (req, res) => {
  const chemistId = req.user._id;
  const medicines = await Medicine.find({ chemist: chemistId });

  const now = new Date();
  const summary = medicines.reduce(
    (acc, med) => {
      acc.totalMedicines += 1;
      acc.inventoryValue += med.sellingPrice * med.stockQuantity;
      if (med.expiryDate < now) acc.expired += 1;
      else if (med.stockQuantity === 0) acc.outOfStock += 1;
      else if (med.stockQuantity <= med.lowStockThreshold) acc.lowStock += 1;
      else acc.midStock += 1;
      return acc;
    },
    { totalMedicines: 0, lowStock: 0, midStock: 0, expired: 0, outOfStock: 0, inventoryValue: 0 }
  );

  res.status(200).json({ success: true, data: summary });
});

module.exports = {
  getMedicines,
  getMedicineById,
  getMyInventory,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getInventorySummary,
};
