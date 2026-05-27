export const validateEmail = (value = '') => /.+@.+\..+/.test(String(value).trim());

export const validateUrl = (value = '') => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email) errors.email = 'Email is required';
  else if (!validateEmail(email)) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

  return errors;
};

export const validateBlogForm = (values) => {
  const errors = {};

  if (!values.title?.trim()) errors.title = 'Title is required';
  if (!values.slug?.trim()) errors.slug = 'Slug is required';
  if (!values.summary?.trim()) errors.summary = 'Summary is required';
  if (!values.content?.trim()) errors.content = 'Content is required';
  if (values.title && values.title.length > 120) errors.title = 'Title should stay under 120 characters';
  if (values.summary && values.summary.length > 300) errors.summary = 'Summary should stay under 300 characters';

  return errors;
};

export const validateSeoForm = (values) => {
  const errors = {};

  if (!values.metaTitle?.trim()) errors.metaTitle = 'Meta title is required';
  if (!values.metaDescription?.trim()) errors.metaDescription = 'Meta description is required';
  const canonicalToValidate = values.canonicalUrl || `http://localhost:3000/blog/${String(values.metaTitle || values.title || 'post')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')}`;

  if (!validateUrl(canonicalToValidate)) errors.canonicalUrl = 'Canonical URL must be valid';

  return errors;
};

export const validateSettingsForm = (values) => {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Name is required';
  if (values.avatar && !validateUrl(values.avatar)) errors.avatar = 'Avatar must be a valid URL';

  return errors;
};
