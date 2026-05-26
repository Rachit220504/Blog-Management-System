import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import BlogCard from '../../components/blog-card';
import { searchPosts, fetchCategories, fetchTags } from '../../lib/api';
import { createBreadcrumbSchema, slugify } from '../../lib/content';
import { createPageMetadata } from '../../lib/seo';
import StructuredData from '../../components/structured-data';

export const revalidate = 60;

export async function generateMetadata({ searchParams }) {
  const params = await Promise.resolve(searchParams || {});
  const query = params.q || '';

  return createPageMetadata({
    title: query ? `Search results for ${query}` : 'Search Atlas Blog',
    description: query ? `Search results for ${query} on Atlas Blog.` : 'Search published Atlas Blog content.',
    pathname: query ? `/search?q=${encodeURIComponent(query)}` : '/search',
    robots: { index: false, follow: true },
  });
}

export default async function SearchPage({ searchParams }) {
  const params = await Promise.resolve(searchParams || {});
  const query = params.q || '';
  const results = query ? await searchPosts(query, { page: 1, limit: 24 }).catch(() => ({ data: [] })) : { data: [] };
  const categories = await fetchCategories().catch(() => []);
  const tags = await fetchTags().catch(() => []);

  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: 'http://localhost:3000/' },
    { name: 'Search', url: 'http://localhost:3000/search' },
  ]);

  return (
    <section className="site-shell pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbs} />
      <div className="panel rounded-[2rem] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Search</p>
        <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Find articles, topics, and SEO resources.</h1>
        <form className="mt-6 flex flex-col gap-3 sm:flex-row" action="/search" method="get">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3">
            <SearchIcon className="h-4 w-4 text-slate-500" />
            <input name="q" defaultValue={query} placeholder="Search by keyword or topic" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <button className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">Search</button>
        </form>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Results</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{query ? `Showing results for “${query}”` : 'Start a search'}</h2>
            </div>
            <p className="text-sm text-slate-400">{results.data?.length || 0} posts</p>
          </div>

          {results.data?.length ? (
            <div className="space-y-4">
              {results.data.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/45 p-10 text-center text-slate-400">
              {query ? 'No matching posts found.' : 'Enter a query to search the blog archive.'}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="panel rounded-[1.5rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Popular categories</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.slice(0, 12).map((category) => (
                <Link key={category} href={`/category/${slugify(category)}`} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                  {category}
                </Link>
              ))}
            </div>
          </div>

          <div className="panel rounded-[1.5rem] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Popular tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(0, 12).map((tag) => (
                <Link key={tag} href={`/tag/${slugify(tag)}`} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
