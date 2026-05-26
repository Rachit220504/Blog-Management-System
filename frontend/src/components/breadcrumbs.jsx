import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-slate-400">
      {items.map((item, index) => (
        <span key={item.url || item.name} className="inline-flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5 text-slate-500" /> : null}
          {item.url ? (
            <Link href={item.url} className="transition-colors hover:text-white">
              {item.name}
            </Link>
          ) : (
            <span className="text-slate-200">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
