const path = require('path');
const cloudinary = require('cloudinary').v2;
const {
  generateUniqueFileName,
  optimizeImageBuffer,
  saveBufferToDisk,
  buildPublicFileUrl,
  deleteLocalFile,
} = require('../utils/uploadUtils');

const isCloudinaryEnabled = () => {
  const uploadProvider = String(process.env.UPLOAD_PROVIDER || 'local').toLowerCase();

  return Boolean(
    uploadProvider === 'cloudinary' &&
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
};

const configureCloudinary = () => {
  if (!isCloudinaryEnabled()) {
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
};

const uploadImageBuffer = async (buffer, originalName, options = {}) => {
  const optimizedBuffer = await optimizeImageBuffer(buffer, options.optimize);
  const extension = 'webp';
  const fileName = generateUniqueFileName(originalName, extension);

  if (configureCloudinary()) {
    const dataUri = `data:image/webp;base64,${optimizedBuffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: options.folder || 'blog-upload',
      resource_type: 'image',
      public_id: path.parse(fileName).name,
      overwrite: false,
    });

    return result;
  }

  const filePath = await saveBufferToDisk(optimizedBuffer, fileName, options.directory);
  return {
    provider: 'local',
    filename: fileName,
    url: buildPublicFileUrl(fileName),
    path: filePath,
    size: optimizedBuffer.length,
    mimetype: 'image/webp',
  };
};

const removeImage = async (fileUrlOrPath) => {
  if (!fileUrlOrPath) {
    return false;
  }

  if (configureCloudinary() && fileUrlOrPath.includes('res.cloudinary.com')) {
    const publicId = fileUrlOrPath.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicId);
    return true;
  }

  const absolutePath = path.isAbsolute(fileUrlOrPath)
    ? fileUrlOrPath
    : path.resolve(process.cwd(), 'public/uploads', path.basename(fileUrlOrPath));

  return deleteLocalFile(absolutePath);
};

const buildMediaResponse = (fileInfo, label = 'image') => ({
  success: true,
  message: `${label} uploaded successfully`,
  data: {
    provider: fileInfo.provider || 'local',
    filename: fileInfo.filename || null,
    url: fileInfo.url || fileInfo.secure_url || fileInfo.path,
    secureUrl: fileInfo.secure_url || fileInfo.url || fileInfo.path,
    width: fileInfo.width || null,
    height: fileInfo.height || null,
    size: fileInfo.size || null,
    mimetype: fileInfo.mimetype || 'image/webp',
  },
});

module.exports = {
  isCloudinaryEnabled,
  uploadImageBuffer,
  removeImage,
  buildMediaResponse,
};