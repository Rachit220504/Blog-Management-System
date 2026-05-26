const path = require('path');
const fs = require('fs');
const ApiResponse = require('../helpers/apiResponse');
const {
  uploadImageBuffer,
  removeImage,
  buildMediaResponse,
} = require('../services/mediaService');
const {
  uploadDir,
} = require('../config/multer');
const { getBufferMimeType } = require('../utils/uploadUtils');

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return ApiResponse.error(res, 'Please select an image to upload', 400);
    }

    const detectedMimeType = getBufferMimeType(req.file.buffer);

    if (!detectedMimeType) {
      return ApiResponse.error(res, 'Invalid or corrupted image file', 400);
    }

    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, {
      folder: 'blog-upload',
      directory: 'public/uploads',
      optimize: { width: 1800, height: 1800, quality: 82 },
    });

    return res.status(201).json(buildMediaResponse(result, 'Image'));
  } catch (error) {
    next(error);
  }
};

const uploadFeatureImage = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      return ApiResponse.error(res, 'Please select a feature image to upload', 400);
    }

    const detectedMimeType = getBufferMimeType(req.file.buffer);

    if (!detectedMimeType) {
      return ApiResponse.error(res, 'Invalid or corrupted image file', 400);
    }

    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, {
      folder: 'blog-features',
      directory: 'public/uploads',
      optimize: { width: 2000, height: 1200, quality: 85 },
    });

    return res.status(201).json(buildMediaResponse(result, 'Feature image'));
  } catch (error) {
    next(error);
  }
};

const uploadMultipleMedia = async (req, res, next) => {
  try {
    if (!Array.isArray(req.files) || req.files.length === 0) {
      return ApiResponse.error(res, 'Please select at least one image to upload', 400);
    }

    const invalidFile = req.files.find((file) => !getBufferMimeType(file.buffer));

    if (invalidFile) {
      return ApiResponse.error(res, 'One or more uploaded files are invalid or corrupted', 400);
    }

    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadImageBuffer(file.buffer, file.originalname, {
          folder: 'blog-gallery',
          directory: 'public/uploads',
          optimize: { width: 1800, height: 1800, quality: 80 },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: 'Images uploaded successfully',
      count: uploads.length,
      data: uploads.map((file) => buildMediaResponse(file, 'Image').data),
    });
  } catch (error) {
    next(error);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return ApiResponse.error(res, 'Media url is required', 400);
    }

    const removed = await removeImage(url);

    return res.status(200).json({
      success: true,
      message: removed ? 'Media deleted successfully' : 'Media not found',
    });
  } catch (error) {
    next(error);
  }
};

const listUploadedMedia = async (req, res, next) => {
  try {
    const files = fs.existsSync(uploadDir)
      ? await fs.promises.readdir(uploadDir)
      : [];

    const media = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(uploadDir, file);
        const stat = await fs.promises.stat(filePath);

        return {
          filename: file,
          url: `/uploads/${file}`,
          size: stat.size,
          createdAt: stat.birthtime,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: media.length,
      data: media,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
  uploadFeatureImage,
  uploadMultipleMedia,
  deleteMedia,
  listUploadedMedia,
};