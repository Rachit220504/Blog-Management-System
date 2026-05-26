import { getSiteUrl } from '../lib/api';

export default function robots() {
  const siteUrl = getSiteUrl().replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}