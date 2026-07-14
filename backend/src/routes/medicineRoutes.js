const express = require('express');
const {
  getMedicines,
  getMedicineById,
  getMyInventory,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getInventorySummary,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validate } = require('../middleware/validate');
const { medicineValidator } = require('../validators/medicineValidators');
const upload = require('../middleware/upload');

const router = express.Router();

// Chemist only inventory management (must be registered before the "/:id" catch all below)
router.get('/inventory/mine', protect, authorize('chemist'), getMyInventory);
router.get('/analytics/summary', protect, authorize('chemist'), getInventorySummary);
router.post(
  '/',
  protect,
  authorize('chemist'),
  upload.array('images', 5),
  medicineValidator,
  validate,
  createMedicine
);
router.patch('/:id', protect, authorize('chemist'), upload.array('images', 5), updateMedicine);
router.delete('/:id', protect, authorize('chemist'), deleteMedicine);

// Public catalog (customers browse without necessarily being logged in)
router.get('/', getMedicines);
router.get('/:id', getMedicineById);

module.exports = router;
