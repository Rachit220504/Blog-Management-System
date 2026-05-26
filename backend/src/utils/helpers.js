/**
 * Converts a string into a URL-safe slug.
 * @param {string} text - The input text to slugify.
 * @returns {string} The formatted slug.
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

/**
 * Ensures a slug is unique for a given model.
 * @param {import('mongoose').Model} model - The mongoose model to query.
 * @param {string} text - The source text used to generate the slug.
 * @param {string} [excludeId] - Optional document id to exclude while checking.
 * @returns {Promise<string>} A unique slug string.
 */
const generateUniqueSlug = async (model, text, excludeId) => {
  const baseSlug = slugify(text);
  let uniqueSlug = baseSlug;
  let suffix = 2;

  while (true) {
    const query = { slug: uniqueSlug };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await model.findOne(query).select('_id').lean();
    if (!existing) {
      return uniqueSlug;
    }

    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
};

/**
 * Extracts a table of contents from markdown-style headings.
 * @param {string} content - Post content.
 * @returns {Array<{id: string, title: string, level: number}>}
 */
const extractTableOfContents = (content) => {
  if (!content) return [];

  const headings = [];
  const headingCounts = new Map();
  const lines = content.split(/\r?\n/);

  lines.forEach((line) => {
    const headingMatch = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (!headingMatch) {
      return;
    }

    const title = headingMatch[2].replace(/\*\*/g, '').trim();
    const baseId = slugify(title);
    const count = headingCounts.get(baseId) || 0;
    headingCounts.set(baseId, count + 1);

    headings.push({
      id: count === 0 ? baseId : `${baseId}-${count + 1}`,
      title,
      level: headingMatch[1].length,
    });
  });

  return headings;
};

/**
 * Calculates estimated reading time in minutes based on content.
 * Average reading speed: 200 words per minute.
 * @param {string} content - The text content of the blog post.
 * @returns {number} Estimated read time in minutes (minimum 1).
 */
const calculateReadTime = (content) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes || 1;
};

module.exports = {
  slugify,
  generateUniqueSlug,
  extractTableOfContents,
  calculateReadTime,
};
