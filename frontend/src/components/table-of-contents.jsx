import Link from 'next/link';

export default function TableOfContents({ items = [] }) {
  if (!items.length) {
    return null;
  }

  return (
    <aside className="panel rounded-[1.5rem] p-5 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">On This Page</p>
      <nav className="mt-4 space-y-2 text-sm text-slate-300">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className={`block rounded-xl border border-transparent px-3 py-2 transition-colors hover:border-cyan-400/20 hover:bg-cyan-400/8 hover:text-white ${
              item.level === 3 ? 'pl-6 text-slate-400' : item.level === 4 ? 'pl-8 text-slate-500' : ''
            }`}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
