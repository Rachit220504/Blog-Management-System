const Post = require('../models/Post');

const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildSEOFields = (payload = {}, existingPost = null) => {
  const seoTitle = payload.metaTitle || payload.title || existingPost?.metaTitle || existingPost?.title || '';
  const seoDescription = payload.metaDescription || payload.excerpt || payload.summary || existingPost?.metaDescription || existingPost?.excerpt || existingPost?.summary || '';
  const image = payload.featureImage || payload.featuredImage || existingPost?.featureImage || existingPost?.featuredImage || '';
  // Normalize canonicalUrl: accept relative URLs (e.g. '/blog/slug') and convert to absolute using FRONTEND_URL
  let canonical = payload.canonicalUrl !== undefined ? payload.canonicalUrl : existingPost?.canonicalUrl || '';
  try {
    if (canonical && String(canonical).startsWith('/') && process.env.FRONTEND_URL) {
      canonical = `${process.env.FRONTEND_URL.replace(/\/$/, '')}${canonical}`;
    }
  } catch (e) {
    // If normalization fails, leave canonical as-is and let later validation handle it
  }

  return {
    metaTitle: payload.metaTitle !== undefined ? payload.metaTitle : existingPost?.metaTitle || seoTitle,
    metaDescription: payload.metaDescription !== undefined ? payload.metaDescription : existingPost?.metaDescription || seoDescription,
    canonicalUrl: canonical !== undefined ? canonical : '',
    featureImage: image,
    featuredImage: image,
    ogTitle: payload.ogTitle !== undefined ? payload.ogTitle : existingPost?.ogTitle || seoTitle,
    ogDescription: payload.ogDescription !== undefined ? payload.ogDescription : existingPost?.ogDescription || seoDescription,
    ogImage: payload.ogImage !== undefined ? payload.ogImage : existingPost?.ogImage || image,
    twitterTitle: payload.twitterTitle !== undefined ? payload.twitterTitle : existingPost?.twitterTitle || seoTitle,
    twitterDescription: payload.twitterDescription !== undefined ? payload.twitterDescription : existingPost?.twitterDescription || seoDescription,
    twitterImage: payload.twitterImage !== undefined ? payload.twitterImage : existingPost?.twitterImage || image,
  };
};

const buildBlogPayload = (body = {}, authorId, existingPost = null) => {
  const tags = body.tags !== undefined ? normalizeList(body.tags) : existingPost?.tags;
  const categories = body.categories !== undefined ? normalizeList(body.categories) : existingPost?.categories;
  const internalLinks = body.internalLinks !== undefined ? (Array.isArray(body.internalLinks) ? body.internalLinks : []) : existingPost?.internalLinks;
  const externalLinks = body.externalLinks !== undefined ? (Array.isArray(body.externalLinks) ? body.externalLinks : []) : existingPost?.externalLinks;
  const seoFields = buildSEOFields(body, existingPost);

  return {
    title: body.title !== undefined ? body.title : existingPost?.title,
    slug: body.slug !== undefined ? body.slug : existingPost?.slug,
    content: body.content !== undefined ? body.content : existingPost?.content,
    excerpt: body.excerpt !== undefined ? body.excerpt : (body.summary !== undefined ? body.summary : existingPost?.excerpt),
    summary: body.summary !== undefined ? body.summary : (body.excerpt !== undefined ? body.excerpt : existingPost?.summary),
    author: authorId || existingPost?.author,
    status: body.status !== undefined ? body.status : existingPost?.status,
    tags,
    categories,
    faq: body.faq !== undefined ? (Array.isArray(body.faq) ? body.faq : []) : existingPost?.faq,
    internalLinks,
    externalLinks,
    keywords: body.keywords !== undefined ? normalizeList(body.keywords) : existingPost?.keywords,
    ...seoFields,
  };
};

const getPublishedPostsQuery = (filters = {}) => {
  const query = { status: 'published' };

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.tag) {
    query.tags = filters.tag;
  }

  if (filters.category) {
    query.categories = filters.category;
  }

  return query;
};

const getUniqueValues = async (field, query = {}) => {
  const values = await Post.distinct(field, query);
  return values.filter(Boolean).sort((left, right) => left.localeCompare(right));
};

const ensureSlugAvailable = async (slug, excludeId) => {
  const query = { slug };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await Post.findOne(query).select('_id').lean();
  return !existing;
};

module.exports = {
  normalizeList,
  buildSEOFields,
  buildBlogPayload,
  getPublishedPostsQuery,
  getUniqueValues,
  ensureSlugAvailable,
};