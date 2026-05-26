export default function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-slate-950/50">
      <div className="site-shell flex flex-col gap-4 py-8 text-sm text-slate-400 sm:py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="font-semibold text-white">Atlas Blog {new Date().getFullYear()}.</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Built for production publishing with canonical URLs, structured data, sitemaps, and crawl-safe defaults.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-slate-300 sm:gap-5">
          <a href="/about" className="transition-colors hover:text-white">About</a>
          <a href="/search" className="transition-colors hover:text-white">Search</a>
          <a href="/contact" className="transition-colors hover:text-white">Contact</a>
        </div>
      </div>
    </footer>
  );
}
