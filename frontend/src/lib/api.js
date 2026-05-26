const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/$/, '');

export const getSiteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const getApiUrl = () => apiBaseUrl;

const createUrl = (pathname, params = {}) => {
  const url = new URL(pathname.replace(/^\//, ''), `${apiBaseUrl}/`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
};

async function requestJson(pathname, { params, next, cache = 'force-cache' } = {}) {
  const response = await fetch(createUrl(pathname, params), {
    method: 'GET',
    cache,
    next,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const fetchPublishedPosts = async ({ page = 1, limit = 9, search = '', tag = '', category = '' } = {}) => {
  return requestJson('/posts', {
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(tag ? { tag } : {}),
      ...(category ? { category } : {}),
    },
    next: { revalidate: 300 },
  });
};

export const fetchPostBySlug = async (slug) => {
  const response = await requestJson(`/posts/slug/${encodeURIComponent(slug)}`, {
    next: { revalidate: 300 },
  });
  return response.data;
};

export const fetchAllPublishedPosts = async () => {
  const response = await requestJson('/posts', {
    params: { page: 1, limit: 1000 },
    next: { revalidate: 600 },
  });

  return response.data || [];
};

export const fetchCategories = async () => {
  const response = await requestJson('/posts/categories', {
    next: { revalidate: 600 },
  });

  return response.data || [];
};

export const fetchTags = async () => {
  const response = await requestJson('/posts/tags', {
    next: { revalidate: 600 },
  });

  return response.data || [];
};

export const fetchPostsByCategory = async (category, options = {}) => {
  return requestJson(`/posts/categories/${encodeURIComponent(category)}`, {
    params: {
      page: options.page || 1,
      limit: options.limit || 12,
    },
    next: { revalidate: 300 },
  });
};

export const fetchPostsByTag = async (tag, options = {}) => {
  return requestJson(`/posts/tags/${encodeURIComponent(tag)}`, {
    params: {
      page: options.page || 1,
      limit: options.limit || 12,
    },
    next: { revalidate: 300 },
  });
};

export const searchPosts = async (query, options = {}) => {
  return requestJson('/posts/search', {
    params: {
      q: query,
      page: options.page || 1,
      limit: options.limit || 12,
    },
    next: { revalidate: 60 },
  });
};

export const fetchAuthorPosts = async (authorSlug, options = {}) => {
  const posts = await fetchAllPublishedPosts();
  const normalizedSlug = String(authorSlug || '').toLowerCase();

  return posts.filter((post) => {
    const authorName = post.author?.name || '';
    const authorSlugValue = String(post.author?.slug || authorName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    return authorSlugValue === normalizedSlug;
  }).slice(0, options.limit || posts.length);
};

export const fetchUniqueAuthors = async () => {
  const posts = await fetchAllPublishedPosts();
  const authors = new Map();

  posts.forEach((post) => {
    const author = post.author;
    if (!author?.name) return;

    const slug = String(author.slug || author.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    if (!authors.has(slug)) {
      authors.set(slug, {
        name: author.name,
        slug,
        bio: author.bio || '',
        avatar: author.avatar || '',
        postCount: 0,
      });
    }

    authors.get(slug).postCount += 1;
  });

  return Array.from(authors.values());
};
