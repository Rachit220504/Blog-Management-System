import { createPageMetadata } from '../../lib/seo';
import { createBreadcrumbSchema } from '../../lib/content';
import StructuredData from '../../components/structured-data';
import { buildCanonicalUrl } from '../../lib/seo';

export const metadata = createPageMetadata({
  title: 'About Atlas Blog',
  description: 'Learn how Atlas Blog is designed for editorial workflows, SEO, and scalable publishing.',
  pathname: '/about',
});

export default function AboutPage() {
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: buildCanonicalUrl('/') },
    { name: 'About', url: buildCanonicalUrl('/about') },
  ]);

  return (
    <section className="site-shell pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbs} />
      <div className="panel rounded-[2rem] p-6 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">About</p>
        <h1 className="mt-4 text-4xl font-semibold text-white md:text-5xl">Built for teams that care about search and publishing discipline.</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          Atlas Blog combines a structured backend workflow with an SEO-first public frontend. The result is a publishing stack that supports editorial review, canonical URLs, schema markup, and a clean reading experience.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ['Editorial flow', 'Drafts, preview, publish states, and role-aware access.'],
            ['SEO control', 'Metadata, social previews, internal links, and structured data.'],
            ['Performance', 'Server-rendered pages, lazy media, and route-level caching.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-white/8 bg-slate-950/45 p-4">
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
