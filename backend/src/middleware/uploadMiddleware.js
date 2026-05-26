const { createUploadMiddleware } = require('../config/multer');

const uploadSingleImage = createUploadMiddleware({ files: 1 }).single('image');
const uploadFeatureImage = createUploadMiddleware({ files: 1 }).single('featureImage');

const uploadMultipleImages = createUploadMiddleware({ files: 10 }).array('images', 10);

module.exports = {
  uploadSingleImage,
  uploadFeatureImage,
  uploadMultipleImages,
};