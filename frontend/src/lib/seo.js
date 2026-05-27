import { getSiteUrl } from './api';

export const buildCanonicalUrl = (pathname = '/') => {
  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const normalizedPath = String(pathname || '/')
    .split('?')[0]
    .split('#')[0]
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
  const path = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

  return `${siteUrl}${path === '/' ? '' : path}` || siteUrl;
};

export const createPageMetadata = ({
  title,
  description,
  pathname = '/',
  image,
  keywords = [],
  robots,
  canonicalUrl,
  type = 'website',
  siteName = 'Atlas Blog',
}) => {
  const resolvedCanonicalUrl = canonicalUrl || buildCanonicalUrl(pathname);
  const hasImage = Boolean(image);
  const resolvedImageAlt = image ? `${title} - Open Graph image` : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: resolvedCanonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: resolvedCanonicalUrl,
      type,
      siteName,
      images: hasImage
        ? [{ url: image, width: 1200, height: 630, alt: resolvedImageAlt }]
        : undefined,
    },
    twitter: {
      card: hasImage ? 'summary_large_image' : 'summary',
      title,
      description,
      images: hasImage ? [image] : undefined,
    },
    robots: robots || { index: true, follow: true },
  };
};

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

export const createCollectionSchema = ({ name, description, url, itemCount = 0, type = 'CollectionPage' }) => ({
  '@context': 'https://schema.org',
  '@type': type,
  name,
  description,
  url,
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: itemCount,
  },
});
