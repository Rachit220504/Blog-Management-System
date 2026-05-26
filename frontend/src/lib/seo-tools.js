import { slugify } from './content';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'the', 'or', 'but', 'for', 'nor', 'on', 'in', 'at', 'to', 'from', 'by', 'with', 'of',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'as', 'it', 'this', 'that', 'these', 'those', 'into',
  'about', 'after', 'before', 'over', 'under', 'between', 'through', 'how', 'why', 'what', 'which', 'who',
]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const stripMarkdown = (value = '') =>
  String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value = '') =>
  stripMarkdown(value)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

export const optimizeSlug = (value = '', { maxLength = 80, prefix = '', suffix = '' } = {}) => {
  const base = slugify(value);
  const parts = [prefix, base, suffix].filter(Boolean).join('-');

  return parts.length > maxLength ? parts.slice(0, maxLength).replace(/-+$/g, '') : parts;
};

export const createAltTextFallback = ({ alt, title, category, keywords = [], src, fallback = 'Article illustration' } = {}) => {
  const providedAlt = String(alt || '').trim();
  if (providedAlt) return providedAlt;

  const derivedKeywords = Array.isArray(keywords) ? keywords.filter(Boolean).slice(0, 2) : [];
  const srcHint = src ? String(src).split('/').pop()?.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ') : '';
  const pieces = [title, category, ...derivedKeywords, srcHint].filter(Boolean);
  const text = pieces.length ? `${pieces[0]}${pieces[1] ? ` - ${pieces[1]}` : ''}` : fallback;

  return text.length > 125 ? `${text.slice(0, 122).replace(/\s+\S*$/, '')}...` : text;
};

export const getKeywordDensity = (content = '', keywords = []) => {
  const sourceText = stripMarkdown(content).toLowerCase();
  const totalWords = sourceText.split(/\s+/).filter(Boolean).length || 1;

  return keywords
    .map((keyword) => {
      const normalized = String(keyword || '').trim().toLowerCase();
      if (!normalized) return null;

      const pattern = new RegExp(`\\b${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
      const matches = sourceText.match(pattern) || [];

      return {
        keyword: normalized,
        count: matches.length,
        density: Number(((matches.length / totalWords) * 100).toFixed(2)),
      };
    })
    .filter(Boolean);
};

export const validateSeoMetadata = ({
  title = '',
  description = '',
  canonicalUrl = '',
  image,
  keywords = [],
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
} = {}) => {
  const issues = [];
  const warnings = [];

  const trimmedTitle = String(title).trim();
  const trimmedDescription = String(description).trim();

  if (!trimmedTitle) issues.push('Missing page title.');
  if (!trimmedDescription) issues.push('Missing meta description.');
  if (!canonicalUrl || !/^https?:\/\//i.test(canonicalUrl)) issues.push('Canonical URL must be absolute.');
  if (trimmedTitle.length > 65) warnings.push('Title is longer than recommended search snippet length.');
  if (trimmedDescription.length < 120) warnings.push('Meta description is shorter than recommended length.');
  if (trimmedDescription.length > 170) warnings.push('Meta description is longer than recommended length.');
  if (!image) warnings.push('No share image provided for Open Graph.');
  if (!ogTitle) warnings.push('Open Graph title missing; falling back to page title.');
  if (!ogDescription) warnings.push('Open Graph description missing; falling back to meta description.');
  if (!twitterTitle) warnings.push('Twitter title missing; falling back to page title.');
  if (!twitterDescription) warnings.push('Twitter description missing; falling back to meta description.');
  if (!Array.isArray(keywords) || keywords.length === 0) warnings.push('No keywords configured.');

  return {
    valid: issues.length === 0,
    issues,
    warnings,
  };
};

export const suggestInternalLinks = ({
  content = '',
  currentSlug = '',
  posts = [],
  maxSuggestions = 5,
} = {}) => {
  const currentTokens = new Set(tokenize(content));
  const currentSlugValue = slugify(currentSlug);

  const suggestions = posts
    .filter((post) => post?.slug && slugify(post.slug) !== currentSlugValue)
    .map((post) => {
      const titleTokens = tokenize(post.title || '');
      const summaryTokens = tokenize(post.summary || '');
      const categoryTokens = (post.categories || []).map((item) => slugify(item));
      const tagTokens = (post.tags || []).map((item) => slugify(item));
      const authorToken = slugify(post.author?.slug || post.author?.name || '');

      let score = 0;
      const matchedTerms = [];

      [...titleTokens, ...summaryTokens].forEach((token) => {
        if (currentTokens.has(token)) {
          score += token.length >= 6 ? 3 : 2;
          matchedTerms.push(token);
        }
      });

      categoryTokens.forEach((token) => {
        if (currentTokens.has(token)) {
          score += 4;
          matchedTerms.push(token);
        }
      });

      tagTokens.forEach((token) => {
        if (currentTokens.has(token)) {
          score += 3;
          matchedTerms.push(token);
        }
      });

      if (authorToken && currentSlugValue && authorToken === currentSlugValue) {
        score += 2;
      }

      return {
        slug: post.slug,
        title: post.title,
        href: `/blog/${post.slug}`,
        score,
        reason: matchedTerms.length ? `Matches: ${Array.from(new Set(matchedTerms)).slice(0, 3).join(', ')}` : 'Topical overlap',
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, maxSuggestions);

  return suggestions;
};

export const calculateSeoScore = ({
  title = '',
  description = '',
  canonicalUrl = '',
  image,
  keywords = [],
  content = '',
  headingCount = 0,
  faqCount = 0,
  internalLinks = [],
  altTextCount = 0,
  openGraphReady = false,
  twitterReady = false,
} = {}) => {
  const validation = validateSeoMetadata({
    title,
    description,
    canonicalUrl,
    image,
    keywords,
    ogTitle: openGraphReady ? title : '',
    ogDescription: openGraphReady ? description : '',
    twitterTitle: twitterReady ? title : '',
    twitterDescription: twitterReady ? description : '',
  });

  let score = 100;

  if (!validation.valid) score -= validation.issues.length * 15;
  score -= validation.warnings.length * 3;

  const titleLength = String(title).trim().length;
  if (titleLength < 30 || titleLength > 70) score -= 8;

  const descriptionLength = String(description).trim().length;
  if (descriptionLength < 120 || descriptionLength > 170) score -= 8;

  const density = getKeywordDensity(content, keywords);
  const targetDensity = density.reduce((total, item) => total + clamp(item.density, 0, 5), 0);
  score += Math.min(6, targetDensity);

  score += Math.min(8, headingCount * 2);
  score += Math.min(6, faqCount * 2);
  score += Math.min(8, internalLinks.length * 2);
  score += Math.min(6, altTextCount * 2);

  if (image) score += 4;
  if (canonicalUrl) score += 4;
  if (openGraphReady) score += 4;
  if (twitterReady) score += 4;

  return {
    score: clamp(Math.round(score), 0, 100),
    validation,
    keywordDensity: density,
  };
};

export const analyzeSeoContent = (options = {}) => {
  const scoreReport = calculateSeoScore(options);
  const internalLinkSuggestions = suggestInternalLinks({
    content: options.content,
    currentSlug: options.currentSlug || '',
    posts: options.posts || [],
    maxSuggestions: options.maxSuggestions || 5,
  });

  return {
    ...scoreReport,
    internalLinkSuggestions,
  };
};
