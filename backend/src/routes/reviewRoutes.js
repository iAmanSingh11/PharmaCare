const express = require('express');
const {
  createReview,
  getMedicineReviews,
  getChemistReviews,
  getReviewableStatus,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { reviewValidator } = require('../validators/reviewValidators');

const router = express.Router();

router.get('/medicine/:medicineId', getMedicineReviews);
router.get('/chemist/:chemistId', getChemistReviews);

router.use(protect);
router.post('/', authorize('customer'), reviewValidator, validate, createReview);
router.get('/reviewable/:orderId', authorize('customer'), getReviewableStatus);

module.exports = router;
