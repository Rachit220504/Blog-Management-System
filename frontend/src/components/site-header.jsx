"use client";

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, Search, X } from 'lucide-react';

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/search', label: 'Search' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="border-b border-white/8 bg-slate-950/35 backdrop-blur-2xl">
      <div className="site-shell flex flex-wrap items-center justify-between gap-4 py-4 sm:py-5">
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[0_0_40px_rgba(56,189,248,0.12)] transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white sm:text-base">Atlas Blog</div>
            <div className="text-[11px] text-slate-400 sm:text-xs">SEO-first publishing system</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-slate-300 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-100 transition-all hover:border-cyan-300/35 hover:bg-cyan-400/15 sm:px-4 sm:text-sm"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Explore</span>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-white/8 bg-slate-950/90 lg:hidden">
          <div className="site-shell flex flex-col gap-2 py-4 text-sm text-slate-300">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition hover:bg-white/10 hover:text-white">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
