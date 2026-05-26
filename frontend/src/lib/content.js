export const slugify = (text = '') =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export const buildTableOfContents = (content = '') => {
  const headings = [];
  const headingCounts = new Map();

  String(content)
    .split(/\r?\n/)
    .forEach((line) => {
      const match = line.match(/^(#{2,4})\s+(.+?)\s*$/);
      if (!match) return;

      const title = match[2].replace(/\*\*/g, '').trim();
      const baseId = slugify(title);
      const count = headingCounts.get(baseId) || 0;
      headingCounts.set(baseId, count + 1);

      headings.push({
        id: count === 0 ? baseId : `${baseId}-${count + 1}`,
        title,
        level: match[1].length,
      });
    });

  return headings;
};

export const formatPublishedDate = (value) => {
  if (!value) return 'Recently';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export const estimateReadingTime = (content = '') => {
  const words = String(content).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const getUniqueCategories = (posts = []) => {
  const categories = new Map();

  posts.forEach((post) => {
    (post.categories || []).forEach((category) => {
      const slug = slugify(category);
      if (!categories.has(slug)) {
        categories.set(slug, { name: category, slug, count: 0 });
      }
      categories.get(slug).count += 1;
    });
  });

  return Array.from(categories.values()).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
};

export const getUniqueTags = (posts = []) => {
  const tags = new Map();

  posts.forEach((post) => {
    (post.tags || []).forEach((tag) => {
      const slug = slugify(tag);
      if (!tags.has(slug)) {
        tags.set(slug, { name: tag, slug, count: 0 });
      }
      tags.get(slug).count += 1;
    });
  });

  return Array.from(tags.values()).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
};

export const getUniqueAuthors = (posts = []) => {
  const authors = new Map();

  posts.forEach((post) => {
    const author = post.author;
    if (!author?.name) return;

    const slug = slugify(author.slug || author.name);
    if (!authors.has(slug)) {
      authors.set(slug, {
        name: author.name,
        slug,
        bio: author.bio || '',
        avatar: author.avatar || '',
        count: 0,
      });
    }

    authors.get(slug).count += 1;
  });

  return Array.from(authors.values()).sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
};

export const createArticleSchema = (post, canonicalUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.metaTitle || post.title,
  description: post.metaDescription || post.summary,
  image: post.featuredImage ? [post.featuredImage] : undefined,
  datePublished: post.publishedAt || post.createdAt,
  dateModified: post.updatedAt || post.publishedAt || post.createdAt,
  author: {
    '@type': 'Person',
    name: post.author?.name || 'Editorial Team',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Atlas Blog',
  },
  mainEntityOfPage: canonicalUrl,
});

export const createFaqSchema = (post, canonicalUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: (post.faq || []).map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
  url: canonicalUrl,
});

export const createBreadcrumbSchema = (items = []) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

