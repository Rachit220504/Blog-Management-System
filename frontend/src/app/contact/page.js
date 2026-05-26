import ContactForm from '../../components/contact-form';
import { createPageMetadata } from '../../lib/seo';
import { createBreadcrumbSchema } from '../../lib/content';
import StructuredData from '../../components/structured-data';
import { buildCanonicalUrl } from '../../lib/seo';

export const metadata = createPageMetadata({
  title: 'Contact Atlas Blog',
  description: 'Contact the Atlas Blog editorial team with partnership, support, or content inquiries.',
  pathname: '/contact',
});

export default function ContactPage() {
  const breadcrumbs = createBreadcrumbSchema([
    { name: 'Home', url: buildCanonicalUrl('/') },
    { name: 'Contact', url: buildCanonicalUrl('/contact') },
  ]);

  return (
    <section className="site-shell pb-16 pt-10 md:pt-16">
      <StructuredData data={breadcrumbs} />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="panel rounded-[2rem] p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Contact</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Get in touch with the editorial team.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Use this page for editorial partnerships, sponsorship questions, content corrections, or general support. The form opens your email client with the message prefilled.
          </p>
          <div className="mt-8 space-y-3 text-sm text-slate-400">
            <p>Email: hello@atlasblog.dev</p>
            <p>Response time: 1-2 business days</p>
            <p>Location: Remote editorial team</p>
          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
