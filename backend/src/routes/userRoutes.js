const express = require('express');
const {
  updateProfile,
  addAddress,
  deleteAddress,
  getNearbyChemists,
  toggleWishlist,
  getWishlist,
  toggleFavoriteShop,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// for Public no login required to browse nearby pharmacies
router.get('/chemists/nearby', getNearbyChemists);

router.use(protect);
router.patch('/profile', upload.single('avatar'), updateProfile);
router.post('/addresses', addAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:medicineId', toggleWishlist);
router.post('/favorites/:chemistId', toggleFavoriteShop);

module.exports = router;
