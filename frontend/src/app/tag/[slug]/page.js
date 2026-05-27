import BlogCard from '../../../components/blog-card';
import StructuredData from '../../../components/structured-data';
import { createBreadcrumbSchema, getUniqueTags, slugify } from '../../../lib/content';
import { buildCanonicalUrl, createCollectionSchema, createPageMetadata } from '../../../lib/seo';
import { fetchAllPublishedPosts } from '../../../lib/api';

export const revalidate = 300;

const humanizeSlug = (value = '') =>
  String(value)
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export async function generateStaticParams() {
  const posts = await fetchAllPublishedPosts().catch(() => []);
  return getUniqueTags(posts).map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;
  const posts = await fetchAllPublishedPosts().catch(() => []);
  const tag = getUniqueTags(posts).find((item) => item.slug === slug);
  const tagName = tag?.name || humanizeSlug(slug);

  return createPageMetadata({
    title: `${tagName} Posts`,
    description: `Explore the latest posts tagged with ${tagName}.`,
    pathname: `/tag/${slug}`,
  });
}

export default async function TagPage({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;

  const posts = await fetchAllPublishedPosts().catch(() => []);
  const tags = getUniqueTags(posts);
  const tag = tags.find((item) => item.slug === slug);
  const tagName = tag?.name || humanizeSlug(slug);

  const filteredPosts = posts.filter((post) => (post.tags || []).some((item) => slugify(item) === slug));
  const canonicalUrl = buildCanonicalUrl(`/tag/${slug}`);
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: buildCanonicalUrl('/') },
    { name: 'Tags', url: buildCanonicalUrl('/search') },
    { name: tagName, url: canonicalUrl },
  ]);
  const schema = createCollectionSchema({
    name: `${tagName} Posts`,
    description: `Browse published posts tagged with ${tagName}.`,
    url: canonicalUrl,
    itemCount: filteredPosts.length,
  });

  return (
    <section className="site-shell pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbs} />
      <StructuredData data={schema} />
      <div className="panel rounded-[2rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Tag</p>
        <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{tagName}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          {filteredPosts.length} published posts grouped under this tag.
        </p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
