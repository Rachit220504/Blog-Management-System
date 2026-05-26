const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const asyncHandler = require('../helpers/asyncHandler');

const router = express.Router();

router.get('/stats', protect, authorize('super_admin', 'editor', 'author'), asyncHandler(getDashboardStats));

module.exports = router;
