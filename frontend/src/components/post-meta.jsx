import Link from 'next/link';
import { CalendarDays, Clock3, UserCircle2 } from 'lucide-react';
import { estimateReadingTime, formatPublishedDate, slugify } from '../lib/content';

export default function PostMeta({ post }) {
  const readingTime = post.readTime || estimateReadingTime(post.content || post.summary || '');
  const authorSlug = slugify(post.author?.slug || post.author?.name || 'author');

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
      <span className="inline-flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-cyan-300" />
        {formatPublishedDate(post.publishedAt || post.createdAt)}
      </span>
      <span className="inline-flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-amber-300" />
        {readingTime} min read
      </span>
      <Link href={`/author/${authorSlug}`} className="inline-flex items-center gap-2 transition-colors hover:text-white">
        <UserCircle2 className="h-4 w-4 text-emerald-300" />
        {post.author?.name || 'Editorial Team'}
      </Link>
    </div>
  );
}
