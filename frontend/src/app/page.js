import Link from 'next/link';
import { ArrowRight, BookOpen, Sparkles, ShieldCheck, Search, ListChecks } from 'lucide-react';
import BlogCard from '../components/blog-card';
import { fetchPublishedPosts, fetchCategories, fetchTags } from '../lib/api';
import { createPageMetadata, buildCanonicalUrl } from '../lib/seo';
import { createBreadcrumbSchema, getUniqueAuthors } from '../lib/content';
import StructuredData from '../components/structured-data';
import Breadcrumbs from '../components/breadcrumbs';

export async function generateMetadata() {
  return createPageMetadata({
    title: 'Atlas Blog',
    description:
      'Production-ready blog publishing with SEO architecture, structured data, and editorial workflows.',
    pathname: '/',
  });
}

const highlights = [
  { icon: ShieldCheck, title: 'JWT + RBAC', text: 'Protected publishing workflows for Super Admin, Editor, Author, and Viewer roles.' },
  { icon: Search, title: 'SEO-first', text: 'Canonical URLs, structured data, Open Graph, Twitter cards, sitemap, and robots.txt.' },
  { icon: ListChecks, title: 'Content workflow', text: 'Draft and publish states, tags, FAQs, read times, and table-of-contents generation.' },
];

export default async function Home({ searchParams }) {
  const resolvedSearchParams = await Promise.resolve(searchParams || {});
  const page = Number(resolvedSearchParams.page || 1);
  const search = resolvedSearchParams.search || '';
  const tag = resolvedSearchParams.tag || '';

  const fallbackPostsResponse = { data: [], pagination: { total: 0, page, pages: 0, limit: 9 } };
  const [postsResponse, categories, tags] = await Promise.all([
    fetchPublishedPosts({ page, limit: 9, search, tag }).catch(() => fallbackPostsResponse),
    fetchCategories().catch(() => []),
    fetchTags().catch(() => []),
  ]);

  const posts = postsResponse.data || [];
  const authors = getUniqueAuthors(posts);
  const featuredPost = posts[0] || null;
  const remainingPosts = posts.slice(1);
  const breadcrumbSchema = createBreadcrumbSchema([{ name: 'Home', url: buildCanonicalUrl('/') }]);

  return (
    <div className="pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbSchema} />
      <section className="site-shell">
        <div className="panel overflow-hidden rounded-[2rem] px-6 py-10 md:px-10 md:py-14 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                <Sparkles className="h-4 w-4" />
                Production Blog Platform
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  A blog stack built for editorial control, search visibility, and secure publishing.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                  This implementation pairs a secure Express + MongoDB backend with a React admin panel and a Next.js frontend that ships structured data, canonical URLs, Open Graph, Twitter cards, FAQ schema, and sitemap automation.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="#latest" className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition-all hover:bg-cyan-300">
                  Browse posts
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a href="#seo" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all hover:border-cyan-400/20 hover:bg-cyan-400/10">
                  View SEO stack
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                <Breadcrumbs items={[{ name: 'Home', url: buildCanonicalUrl('/') }]} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-10 top-8 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -bottom-10 right-0 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />

              <div className="panel relative overflow-hidden rounded-[1.8rem] border border-cyan-400/12 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-cyan-200">Live content feed</div>
                    <div className="mt-1 text-xl font-semibold text-white">{postsResponse.pagination?.total || 0} published posts</div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    Published
                  </div>
                </div>

                {featuredPost ? (
                  <BlogCard post={featuredPost} featured />
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-10 text-center text-slate-400">
                    No published posts yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="seo" className="site-shell mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel rounded-[1.75rem] p-6 md:p-8">
          <div className="flex items-center gap-2 text-cyan-200">
            <BookOpen className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">SEO architecture</span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-white md:text-3xl">Crawl-friendly by default.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Posts are rendered with article metadata, canonical URLs, social previews, FAQ JSON-LD, and a sitemap that reflects the published content set.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              'Open Graph + Twitter cards',
              'Canonical URLs and metadata inheritance',
              'Table of contents generation from headings',
              'Article + FAQ structured data',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-slate-950/40 px-4 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <Link key={category} href={`/category/${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                {category}
              </Link>
            ))}
          </div>
        </div>

        <div className="panel rounded-[1.75rem] p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Search filters</div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search posts by keyword"
              className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/30"
            />
            <input
              name="tag"
              defaultValue={tag}
              placeholder="Tag filter"
              className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/30"
            />
            <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Filter
            </button>
          </form>

          <div id="latest" className="mt-6 space-y-4">
            {remainingPosts.length ? (
              remainingPosts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-8 text-sm text-slate-400">
                No additional posts matched your filters.
              </div>
            )}
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-slate-950/45 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Authors</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {authors.slice(0, 8).map((author) => (
                <Link key={author.slug} href={`/author/${author.slug}`} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                  {author.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
