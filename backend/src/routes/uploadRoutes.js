const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const asyncHandler = require('../helpers/asyncHandler');
const { uploadSingleImage, uploadFeatureImage, uploadMultipleImages } = require('../middleware/uploadMiddleware');
const {
  uploadImage,
  uploadFeatureImage: uploadFeatureImageController,
  uploadMultipleMedia,
  deleteMedia,
  listUploadedMedia,
} = require('../controllers/mediaController');

const router = express.Router();

const uploadErrorHandler = (error, req, res, next) => {
  if (!error) {
    return next();
  }

  const message = error.code === 'LIMIT_FILE_SIZE'
    ? 'File too large. Maximum allowed size is 5MB.'
    : error.message || 'Upload failed';

  return res.status(400).json({
    success: false,
    message,
  });
};

router.get('/media', protect, authorize('super_admin', 'editor', 'author'), asyncHandler(listUploadedMedia));
router.post('/image', protect, authorize('super_admin', 'editor', 'author'), uploadSingleImage, asyncHandler(uploadImage), uploadErrorHandler);
router.post('/feature-image', protect, authorize('super_admin', 'editor', 'author'), uploadFeatureImage, asyncHandler(uploadFeatureImageController), uploadErrorHandler);
router.post('/gallery', protect, authorize('super_admin', 'editor', 'author'), uploadMultipleImages, asyncHandler(uploadMultipleMedia), uploadErrorHandler);
router.delete('/media', protect, authorize('super_admin', 'editor', 'author'), asyncHandler(deleteMedia));

// Backward-compatible default upload endpoint
router.post('/', protect, authorize('super_admin', 'editor', 'author'), uploadSingleImage, asyncHandler(uploadImage), uploadErrorHandler);

module.exports = router;
