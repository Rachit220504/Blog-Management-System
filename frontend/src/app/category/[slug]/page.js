import BlogCard from '../../../components/blog-card';
import StructuredData from '../../../components/structured-data';
import { createBreadcrumbSchema, getUniqueCategories, slugify } from '../../../lib/content';
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
  return getUniqueCategories(posts).map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;
  const posts = await fetchAllPublishedPosts().catch(() => []);
  const category = getUniqueCategories(posts).find((item) => item.slug === slug);
  const categoryName = category?.name || humanizeSlug(slug);

  return createPageMetadata({
    title: `${categoryName} Articles`,
    description: `Read the latest articles filed under ${categoryName}.`,
    pathname: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;

  const posts = await fetchAllPublishedPosts().catch(() => []);
  const categories = getUniqueCategories(posts);
  const category = categories.find((item) => item.slug === slug);
  const categoryName = category?.name || humanizeSlug(slug);

  const filteredPosts = posts.filter((post) => (post.categories || []).some((item) => slugify(item) === slug));
  const canonicalUrl = buildCanonicalUrl(`/category/${slug}`);
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: buildCanonicalUrl('/') },
    { name: 'Categories', url: buildCanonicalUrl('/search') },
    { name: categoryName, url: canonicalUrl },
  ]);
  const schema = createCollectionSchema({
    name: `${categoryName} Articles`,
    description: `Browse published posts tagged with ${categoryName}.`,
    url: canonicalUrl,
    itemCount: filteredPosts.length,
  });

  return (
    <section className="site-shell pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbs} />
      <StructuredData data={schema} />
      <div className="panel rounded-[2rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Category</p>
        <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{categoryName}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
          {filteredPosts.length} published posts grouped under this category.
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
