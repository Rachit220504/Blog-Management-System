const express = require('express');
const asyncHandler = require('../helpers/asyncHandler');
const { recordPageView } = require('../controllers/analyticsController');

const router = express.Router();

router.post('/pageview', asyncHandler(recordPageView));

module.exports = router;