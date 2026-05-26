const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const allowedMimeTypes = new Set(
  (process.env.UPLOAD_ALLOWED_MIME_TYPES || 'image/jpeg,image/jpg,image/png,image/webp,image/gif')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed'));
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

  if (extension && !allowedExtensions.has(extension)) {
    return cb(new Error('File extension is not allowed'));
  }

  cb(null, true);
};

const createUploadMiddleware = (options = {}) => {
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: Number(process.env.UPLOAD_MAX_FILE_SIZE || options.maxFileSize || 5 * 1024 * 1024),
      files: options.files || 1,
    },
  });
};

module.exports = {
  uploadDir,
  allowedMimeTypes,
  createUploadMiddleware,
};