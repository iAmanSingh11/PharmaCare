const express = require('express');
const { getOverview, getUsers, verifyChemist, toggleUserActive } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

const router = express.Router();

// Every route here requires an authenticated admin
router.use(protect, authorize('admin'));

router.get('/overview', getOverview);
router.get('/users', getUsers);
router.patch('/users/:id/verify', verifyChemist);
router.patch('/users/:id/toggle-active', toggleUserActive);

module.exports = router;
