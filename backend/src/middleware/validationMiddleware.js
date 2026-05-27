const validator = require('validator');
const { validateSeoString, validateSeoUrl } = require('../utils/seoHelpers');

const sendValidationError = (res, message) => {
  return res.status(400).json({
    success: false,
    message,
  });
};

const isValidRole = (role) => ['super_admin', 'editor', 'author', 'user'].includes(role);

const isValidStatus = (status) => ['draft', 'published'].includes(status);

const validateMongoIdParam = (paramName = 'id') => (req, res, next) => {
  if (!validator.isMongoId(req.params[paramName])) {
    return sendValidationError(res, `Invalid ${paramName} parameter`);
  }

  next();
};

const validateRegisterUser = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return sendValidationError(res, 'Name, email, and password are required');
  }

  if (!validator.isEmail(String(email))) {
    return sendValidationError(res, 'Please provide a valid email address');
  }

  if (!validator.isLength(String(name).trim(), { min: 2, max: 50 })) {
    return sendValidationError(res, 'Name must be between 2 and 50 characters');
  }

  if (!validator.isLength(String(password), { min: 6 })) {
    return sendValidationError(res, 'Password must be at least 6 characters long');
  }

  next();
};

const validateLoginUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendValidationError(res, 'Email and password are required');
  }

  if (!validator.isEmail(String(email))) {
    return sendValidationError(res, 'Please provide a valid email address');
  }

  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { name, bio, avatar, password } = req.body;

  if (name !== undefined && !validator.isLength(String(name).trim(), { min: 2, max: 50 })) {
    return sendValidationError(res, 'Name must be between 2 and 50 characters');
  }

  if (bio !== undefined && !validator.isLength(String(bio), { max: 200 })) {
    return sendValidationError(res, 'Bio cannot exceed 200 characters');
  }

  if (avatar !== undefined && avatar && !validator.isURL(String(avatar), { require_protocol: true })) {
    return sendValidationError(res, 'Avatar must be a valid URL');
  }

  if (password !== undefined && password && !validator.isLength(String(password), { min: 6 })) {
    return sendValidationError(res, 'Password must be at least 6 characters long');
  }

  next();
};

const validateAuthRefresh = (req, res, next) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) {
    return sendValidationError(res, 'Refresh token is required');
  }

  next();
};

const validatePostPayload = (req, res, next) => {
  const {
    title,
    content,
    summary,
    excerpt,
    status,
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
    slug,
  } = req.body;

  if (req.method === 'POST') {
    if (!title || !content || !(summary || excerpt)) {
      return sendValidationError(res, 'Title, excerpt/summary, and content are required');
    }
  }

  if (title !== undefined && !validator.isLength(String(title).trim(), { min: 3, max: 150 })) {
    return sendValidationError(res, 'Title must be between 3 and 150 characters');
  }

  const effectiveExcerpt = excerpt || summary;

  if (effectiveExcerpt !== undefined && !validator.isLength(String(effectiveExcerpt).trim(), { min: 10, max: 300 })) {
    return sendValidationError(res, 'Excerpt must be between 10 and 300 characters');
  }

  if (content !== undefined && !validator.isLength(String(content).trim(), { min: 20 })) {
    return sendValidationError(res, 'Content must be at least 20 characters long');
  }

  if (status !== undefined && !isValidStatus(status)) {
    return sendValidationError(res, 'Status must be draft or published');
  }

  if (metaTitle !== undefined && !validator.isLength(String(metaTitle).trim(), { max: 70 })) {
    return sendValidationError(res, 'Meta title cannot exceed 70 characters');
  }

  if (metaDescription !== undefined && !validator.isLength(String(metaDescription).trim(), { max: 160 })) {
    return sendValidationError(res, 'Meta description cannot exceed 160 characters');
  }

  if (canonicalUrl !== undefined && canonicalUrl && !validator.isURL(String(canonicalUrl), { require_protocol: true })) {
    // Allow relative canonical URLs (starting with '/') — they'll be normalized server-side.
    if (!String(canonicalUrl).startsWith('/')) {
      return sendValidationError(res, 'Canonical URL must be a valid URL');
    }
  }

  if (!validateSeoString(ogTitle, 70)) {
    return sendValidationError(res, 'OG title cannot exceed 70 characters');
  }

  if (!validateSeoString(ogDescription, 160)) {
    return sendValidationError(res, 'OG description cannot exceed 160 characters');
  }

  if (!validateSeoUrl(ogImage)) {
    return sendValidationError(res, 'OG image must be a valid URL');
  }

  if (!validateSeoString(twitterTitle, 70)) {
    return sendValidationError(res, 'Twitter title cannot exceed 70 characters');
  }

  if (!validateSeoString(twitterDescription, 160)) {
    return sendValidationError(res, 'Twitter description cannot exceed 160 characters');
  }

  if (!validateSeoUrl(twitterImage)) {
    return sendValidationError(res, 'Twitter image must be a valid URL');
  }

  if (slug !== undefined && slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug))) {
    return sendValidationError(res, 'Slug must be URL-safe and lowercase');
  }

  next();
};

const validateBlogQuery = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined && !validator.isInt(String(page), { min: 1 })) {
    return sendValidationError(res, 'Page must be a positive integer');
  }

  if (limit !== undefined && !validator.isInt(String(limit), { min: 1, max: 100 })) {
    return sendValidationError(res, 'Limit must be between 1 and 100');
  }

  next();
};

const validateSearchQuery = (req, res, next) => {
  const searchValue = req.query.q || req.query.search || '';

  if (searchValue && !validator.isLength(String(searchValue).trim(), { min: 2, max: 200 })) {
    return sendValidationError(res, 'Search query must be between 2 and 200 characters');
  }

  next();
};

const validateTaxonomyQuery = (req, res, next) => {
  const { name } = req.query;
  const taxonomyValue = name || req.params.category || req.params.tag || '';

  if (taxonomyValue && !validator.isLength(String(taxonomyValue).trim(), { min: 1, max: 100 })) {
    return sendValidationError(res, 'Taxonomy filter must be between 1 and 100 characters');
  }

  next();
};

const validateRoleUpdate = (req, res, next) => {
  const { role } = req.body;

  if (!role || !isValidRole(role)) {
    return sendValidationError(res, 'Please provide a valid role');
  }

  next();
};

module.exports = {
  validateMongoIdParam,
  validateRegisterUser,
  validateLoginUser,
  validateProfileUpdate,
  validateAuthRefresh,
  validatePostPayload,
  validateBlogQuery,
  validateSearchQuery,
  validateTaxonomyQuery,
  validateRoleUpdate,
};