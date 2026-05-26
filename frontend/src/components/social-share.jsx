import { Share2 } from 'lucide-react';

export default function SocialShare({ url, title }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/45 p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
        <Share2 className="h-4 w-4" />
        Share this article
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-400/25 hover:bg-cyan-400/10 hover:text-white"
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
}
