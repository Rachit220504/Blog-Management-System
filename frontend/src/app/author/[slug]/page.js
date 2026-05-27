import { notFound } from 'next/navigation';
import Image from 'next/image';
import BlogCard from '../../../components/blog-card';
import StructuredData from '../../../components/structured-data';
import { createBreadcrumbSchema, getUniqueAuthors } from '../../../lib/content';
import { buildCanonicalUrl, createCollectionSchema, createPageMetadata } from '../../../lib/seo';
import { fetchAllPublishedPosts } from '../../../lib/api';

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await fetchAllPublishedPosts().catch(() => []);
  return getUniqueAuthors(posts).map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;
  const posts = await fetchAllPublishedPosts().catch(() => []);
  const author = getUniqueAuthors(posts).find((item) => item.slug === slug);

  if (!author) {
    return createPageMetadata({
      title: 'Author not found',
      description: 'The requested author could not be found.',
      pathname: `/author/${slug}`,
      robots: { index: false, follow: false },
    });
  }

  return createPageMetadata({
    title: `${author.name} Articles`,
    description: `Explore all published articles written by ${author.name}.`,
    pathname: `/author/${author.slug}`,
  });
}

export default async function AuthorPage({ params }) {
  const resolvedParams = await Promise.resolve(params || {});
  const slug = resolvedParams.slug;

  const posts = await fetchAllPublishedPosts().catch(() => []);
  const authors = getUniqueAuthors(posts);
  const author = authors.find((item) => item.slug === slug);

  if (!author) {
    notFound();
  }

  const filteredPosts = posts.filter((post) => {
    const authorSlug = String(post.author?.slug || post.author?.name || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    return authorSlug === author.slug;
  });

  const canonicalUrl = buildCanonicalUrl(`/author/${author.slug}`);
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: buildCanonicalUrl('/') },
    { name: 'Authors', url: buildCanonicalUrl('/search') },
    { name: author.name, url: canonicalUrl },
  ]);
  const schema = createCollectionSchema({
    name: `${author.name} Articles`,
    description: `Browse articles written by ${author.name}.`,
    url: canonicalUrl,
    itemCount: filteredPosts.length,
  });

  return (
    <section className="site-shell pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbs} />
      <StructuredData data={schema} />
      <div className="panel rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <Image
            src={author.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${author.name}`}
            alt={author.name}
            width={96}
            height={96}
            className="rounded-3xl border border-white/10 object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Author</p>
            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl">{author.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
              {author.bio || 'Editorial contributor with a focused publishing profile.'}
            </p>
            <p className="mt-3 text-sm text-slate-400">{filteredPosts.length} published articles</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
