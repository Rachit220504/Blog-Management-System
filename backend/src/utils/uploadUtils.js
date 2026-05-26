const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const getUploadBaseUrl = () => {
  return (process.env.UPLOAD_BASE_URL || 'http://localhost:5000/uploads').replace(/\/$/, '');
};

const sanitizeFileName = (inputName = '') => {
  return String(inputName)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const generateUniqueFileName = (originalName, extension = 'jpg') => {
  const baseName = sanitizeFileName(path.parse(originalName || 'image').name);
  const randomId = crypto.randomBytes(8).toString('hex');
  return `${baseName || 'image'}-${Date.now()}-${randomId}.${extension}`;
};

const getBufferMimeType = (buffer) => {
  if (!buffer || buffer.length < 4) {
    return null;
  }

  const signature = buffer.toString('hex', 0, 4);
  if (signature.startsWith('ffd8ff')) return 'image/jpeg';
  if (signature.startsWith('89504e47')) return 'image/png';
  if (signature.startsWith('47494638')) return 'image/gif';
  if (signature.startsWith('52494646')) return 'image/webp';
  return null;
};

const optimizeImageBuffer = async (buffer, { width = 1600, height = 1600, quality = 82 } = {}) => {
  return sharp(buffer)
    .rotate()
    .resize({
      width,
      height,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer();
};

const saveBufferToDisk = async (buffer, fileName, directory) => {
  const targetDir = path.resolve(process.cwd(), directory || process.env.UPLOAD_DIR || 'public/uploads');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);
  await fs.promises.writeFile(filePath, buffer);

  return filePath;
};

const buildPublicFileUrl = (fileName) => {
  return `${getUploadBaseUrl()}/${encodeURIComponent(fileName)}`;
};

const deleteLocalFile = async (absoluteFilePath) => {
  try {
    await fs.promises.unlink(absoluteFilePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
};

module.exports = {
  getUploadBaseUrl,
  sanitizeFileName,
  generateUniqueFileName,
  getBufferMimeType,
  optimizeImageBuffer,
  saveBufferToDisk,
  buildPublicFileUrl,
  deleteLocalFile,
};