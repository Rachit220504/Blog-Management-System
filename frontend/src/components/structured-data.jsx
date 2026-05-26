export default function StructuredData({ data }) {
  if (!data) return null;

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function BreadcrumbJsonLd({ items = [] }) {
  if (!items.length) return null;

  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function ArticleJsonLd({ post, url }) {
  if (!post) return null;

  return (
    <StructuredData
      data={{
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
        mainEntityOfPage: url,
      }}
    />
  );
}

export function FaqJsonLd({ items = [], url }) {
  if (!items.length) return null;

  return (
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        url,
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }}
    />
  );
}
