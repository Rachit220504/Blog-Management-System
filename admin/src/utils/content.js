export const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export const splitList = (value = '') =>
  String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const joinList = (items = []) => items.filter(Boolean).join(', ');

export const stripHtml = (value = '') =>
  String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const estimateReadTime = (value = '') => {
  const words = stripHtml(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

export const seoScoreFromPost = (post = {}) => {
  const checks = [
    post.title?.length > 20 && post.title?.length < 70,
    post.summary?.length > 120 && post.summary?.length < 170,
    post.slug,
    post.featuredImage || post.featureImage,
    post.metaTitle || post.seo?.metaTitle,
    post.metaDescription || post.seo?.metaDescription,
    Array.isArray(post.tags) && post.tags.length > 0,
    Array.isArray(post.keywords) && post.keywords.length > 0,
  ];

  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return Number.isNaN(score) ? 0 : score;
};

export const buildPreviewUrl = (slug) => {
  const base = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/blog/${slug}`;
};
