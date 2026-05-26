const express = require('express');
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/securityMiddleware');
const asyncHandler = require('../helpers/asyncHandler');
const {
  validateRegisterUser,
  validateLoginUser,
  validateProfileUpdate,
  validateAuthRefresh,
} = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', authLimiter, validateRegisterUser, asyncHandler(registerUser));
router.post('/login', authLimiter, validateLoginUser, asyncHandler(loginUser));
router.post('/refresh-token', validateAuthRefresh, asyncHandler(refreshAccessToken));
router.post('/logout', validateAuthRefresh, asyncHandler(logoutUser));

router
  .route('/profile')
  .get(protect, asyncHandler(getUserProfile))
  .put(protect, validateProfileUpdate, asyncHandler(updateUserProfile));

module.exports = router;
