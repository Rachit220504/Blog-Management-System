import { fetchAllPublishedPosts, fetchCategories, fetchTags, fetchUniqueAuthors, getSiteUrl } from '../lib/api';
import { slugify } from '../lib/content';

export default async function sitemap() {
  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const posts = await fetchAllPublishedPosts().catch(() => []);
  const categories = await fetchCategories().catch(() => []);
  const tags = await fetchTags().catch(() => []);
  const authors = await fetchUniqueAuthors().catch(() => []);

  const staticRoutes = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
    },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/contact`, lastModified: new Date() },
    { url: `${siteUrl}/search`, lastModified: new Date() },
  ];

  const postRoutes = posts
    .filter((post) => post.status === 'published')
    .map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt || post.createdAt || new Date(),
    }));

  const categoryRoutes = categories.map((category) => ({
    url: `${siteUrl}/category/${slugify(category)}`,
    lastModified: new Date(),
  }));

  const tagRoutes = tags.map((tag) => ({
    url: `${siteUrl}/tag/${slugify(tag)}`,
    lastModified: new Date(),
  }));

  const authorRoutes = authors.map((author) => ({
    url: `${siteUrl}/author/${author.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...postRoutes, ...categoryRoutes, ...tagRoutes, ...authorRoutes];
}