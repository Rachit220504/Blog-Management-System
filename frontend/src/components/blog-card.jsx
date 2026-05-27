import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, Clock3, ArrowUpRight } from 'lucide-react';
import { formatPublishedDate, estimateReadingTime } from '../lib/content';
import { slugify } from '../lib/content';
import { createAltTextFallback } from '../lib/seo-tools';

export default function BlogCard({ post, featured = false }) {
  const safePost = post || {};
  const href = safePost.slug ? `/blog/${safePost.slug}` : '/';
  const title = safePost.title || 'Untitled post';
  const summary = safePost.summary || safePost.excerpt || '';
  const readingTime = safePost.readTime || estimateReadingTime(safePost.content || summary);
  const firstCategory = Array.isArray(safePost.categories) ? safePost.categories[0] : null;
  const authorName = typeof safePost.author === 'object' ? safePost.author?.name : '';
  const authorSlug = slugify(
    typeof safePost.author === 'object' ? safePost.author?.slug || safePost.author?.name || 'author' : 'author'
  );

  return (
    <article
      className={`group overflow-hidden rounded-[1.5rem] border border-white/8 bg-[rgba(10,16,29,0.75)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_28px_90px_rgba(14,165,233,0.12)] ${
        featured ? 'md:grid md:grid-cols-[1.1fr_0.9fr]' : ''
      }`}
    >
      <div className="relative min-h-56 overflow-hidden bg-slate-900/80 sm:min-h-64">
        {safePost.featuredImage ? (
          <Image
            src={safePost.featuredImage}
            alt={createAltTextFallback({
              title,
              category: firstCategory,
              keywords: safePost.keywords,
              src: safePost.featuredImage,
            })}
            fill
            priority={featured}
            sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_40%),linear-gradient(135deg,#0f172a,#111827)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 px-4 py-3 text-[11px] text-slate-200 sm:px-5 sm:py-4 sm:text-xs">
          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 backdrop-blur">
            {safePost.status === 'published' ? 'Live' : 'Draft'}
          </span>
          <span className="mono rounded-full border border-white/10 bg-black/25 px-3 py-1 backdrop-blur">
            /{safePost.slug || 'post'}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 md:p-7">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {firstCategory ? (
              <Link href={`/category/${slugify(firstCategory)}`} className="rounded-full border border-emerald-400/15 bg-emerald-400/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-100 transition hover:border-emerald-300/25 hover:bg-emerald-400/12">
                {firstCategory}
              </Link>
            ) : null}
            {(Array.isArray(safePost.tags) ? safePost.tags : []).slice(0, 4).map((tag) => (
              <Link key={tag} href={`/tag/${slugify(tag)}`} className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-cyan-100 transition hover:border-cyan-300/25 hover:bg-cyan-400/12">
                {tag}
              </Link>
            ))}
          </div>

          <Link href={href} className="block">
            <h2 className={`font-semibold tracking-tight text-white transition-colors group-hover:text-cyan-100 ${featured ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-xl sm:text-2xl'}`}>
              {title}
            </h2>
          </Link>

          <p className="max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            {summary}
          </p>
        </div>

        <div className="flex flex-col gap-4 text-sm text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-cyan-300" />
              {formatPublishedDate(safePost.publishedAt || safePost.createdAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-amber-300" />
              {readingTime} min read
            </span>
            {authorName ? (
              <Link href={`/author/${authorSlug}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                {authorName}
              </Link>
            ) : null}
          </div>

          <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition-colors hover:text-white">
            Read article
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
