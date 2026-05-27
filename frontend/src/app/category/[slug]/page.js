import { notFound } from 'next/navigation';
import BlogCard from '../../../components/blog-card';
import StructuredData from '../../../components/structured-data';
import { createBreadcrumbSchema, getUniqueCategories, slugify } from '../../../lib/content';
import { buildCanonicalUrl, createCollectionSchema, createPageMetadata } from '../../../lib/seo';
import { fetchAllPublishedPosts } from '../../../lib/api';

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await fetchAllPublishedPosts().catch(() => []);
  return getUniqueCategories(posts).map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;
  const posts = await fetchAllPublishedPosts().catch(() => []);
  const category = getUniqueCategories(posts).find((item) => item.slug === slug);

  if (!category) {
    return createPageMetadata({
      title: 'Category not found',
      description: 'The requested category could not be found.',
      pathname: `/category/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return createPageMetadata({
    title: `${category.name} Articles`,
    description: `Read the latest articles filed under ${category.name}.`,
    pathname: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;

  const posts = await fetchAllPublishedPosts().catch(() => []);
  const categories = getUniqueCategories(posts);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const filteredPosts = posts.filter((post) => (post.categories || []).some((item) => slugify(item) === category.slug));
  const canonicalUrl = buildCanonicalUrl(`/category/${category.slug}`);
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: buildCanonicalUrl('/') },
    { name: 'Categories', url: buildCanonicalUrl('/search') },
    { name: category.name, url: canonicalUrl },
  ]);
  const schema = createCollectionSchema({
    name: `${category.name} Articles`,
    description: `Browse published posts tagged with ${category.name}.`,
    url: canonicalUrl,
    itemCount: filteredPosts.length,
  });

  return (
    <section className="site-shell pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbs} />
      <StructuredData data={schema} />
      <div className="panel rounded-[2rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Category</p>
        <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">{category.name}</h1>
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
