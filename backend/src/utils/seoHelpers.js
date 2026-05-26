const validator = require('validator');

const buildCanonicalUrl = (siteUrl, slug) => {
  if (!siteUrl || !slug) return '';
  return `${String(siteUrl).replace(/\/$/, '')}/blog/${slug}`;
};

const validateSeoString = (value, maxLength) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  return validator.isLength(String(value).trim(), { min: 1, max: maxLength });
};

const validateSeoUrl = (value) => {
  if (value === undefined || value === null || value === '') {
    return true;
  }

  return validator.isURL(String(value), { require_protocol: true });
};

module.exports = {
  buildCanonicalUrl,
  validateSeoString,
  validateSeoUrl,
};