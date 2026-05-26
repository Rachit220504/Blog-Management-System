import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { ArticleJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '../../../components/structured-data';
import TableOfContents from '../../../components/table-of-contents';
import PostContent from '../../../components/post-content';
import PostMeta from '../../../components/post-meta';
import SocialShare from '../../../components/social-share';
import RelatedPosts from '../../../components/related-posts';
import Breadcrumbs from '../../../components/breadcrumbs';
import { fetchPostBySlug, fetchAllPublishedPosts, getSiteUrl } from '../../../lib/api';
import {
  buildTableOfContents,
  estimateReadingTime,
  slugify,
} from '../../../lib/content';
import { buildCanonicalUrl, createPageMetadata } from '../../../lib/seo';
import { analyzeSeoContent, createAltTextFallback } from '../../../lib/seo-tools';

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await fetchAllPublishedPosts().catch(() => []);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = await fetchPostBySlug(params.slug).catch(() => null);

  if (!post) {
    return createPageMetadata({
      title: 'Post not found',
      description: 'The requested post could not be located.',
      pathname: `/blog/${params.slug}`,
      robots: { index: false, follow: false },
    });
  }

  return createPageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.summary,
    pathname: `/blog/${post.slug}`,
    image: post.featuredImage,
    keywords: post.keywords,
    robots: post.status === 'published' ? { index: true, follow: true } : { index: false, follow: false },
    type: 'article',
  });
}

export default async function BlogPostPage({ params }) {
  const [post, allPosts] = await Promise.all([
    fetchPostBySlug(params.slug).catch(() => null),
    fetchAllPublishedPosts().catch(() => []),
  ]);

  if (!post) {
    notFound();
  }

  const siteUrl = getSiteUrl().replace(/\/$/, '');
  const canonicalUrl = post.canonicalUrl || `${siteUrl}/blog/${post.slug}`;
  const toc = post.tableOfContents?.length ? post.tableOfContents : buildTableOfContents(post.content);
  const readingTime = post.readTime || estimateReadingTime(post.content);
  const breadcrumbItems = [
    { name: 'Home', url: buildCanonicalUrl('/') },
    { name: 'Blog', url: buildCanonicalUrl('/') },
    { name: post.title, url: canonicalUrl },
  ];
  const relatedPosts = allPosts
    .filter((item) => item._id !== post._id)
    .filter((item) => {
      const postTags = new Set((post.tags || []).map((tag) => slugify(tag)));
      const postCategories = new Set((post.categories || []).map((category) => slugify(category)));
      const itemTags = (item.tags || []).some((tag) => postTags.has(slugify(tag)));
      const itemCategories = (item.categories || []).some((category) => postCategories.has(slugify(category)));
      const sameAuthor = slugify(item.author?.slug || item.author?.name || '') === slugify(post.author?.slug || post.author?.name || '');

      return itemTags || itemCategories || sameAuthor;
    })
    .slice(0, 3);
  const seoAnalysis = analyzeSeoContent({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.summary,
    canonicalUrl,
    image: post.featuredImage,
    keywords: post.keywords || [],
    content: post.content,
    headingCount: toc.length,
    faqCount: post.faq?.length || 0,
    internalLinks: relatedPosts,
    altTextCount: (post.content || '').match(/!\[[^\]]*\]\([^\)]+\)/g)?.length || 0,
    openGraphReady: true,
    twitterReady: true,
    posts: allPosts,
    currentSlug: post.slug,
    maxSuggestions: 4,
  });

  return (
    <article className="pb-16 pt-8 md:pt-14">
      <ArticleJsonLd post={post} url={canonicalUrl} />
      <FaqJsonLd items={post.faq || []} url={canonicalUrl} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <section className="site-shell">
        <Breadcrumbs items={breadcrumbItems} />
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to all posts
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <header className="panel overflow-hidden rounded-[2rem] p-6 md:p-8">
              <div className="flex flex-wrap gap-2">
                {(post.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
                {post.title}
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                {post.summary}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-slate-400">
                <PostMeta post={post} />
                <span className="inline-flex items-center gap-2">
                  Canonical: <span className="mono text-slate-200">{canonicalUrl}</span>
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-white/8 bg-slate-950/40 p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={post.author?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${post.author?.name || 'Atlas'}`}
                    alt={createAltTextFallback({
                      title: post.author?.name || 'Author',
                      fallback: 'Author profile image',
                    })}
                    width={52}
                    height={52}
                    className="rounded-2xl border border-white/10 object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-white">{post.author?.name || 'Editorial Team'}</div>
                    <div className="text-xs text-slate-400">{post.author?.bio || 'Published by the Atlas editorial workflow.'}</div>
                  </div>
                </div>

                <div className="ml-auto rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.22em] text-slate-300">
                  {post.status} article
                </div>
              </div>
            </header>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="panel rounded-[2rem] p-6 md:p-8">
                <div className="blog-prose space-y-6">
                  <PostContent content={post.content} />
                </div>

                {post.faq?.length ? (
                  <section className="mt-12 border-t border-white/8 pt-8">
                    <h2 className="text-2xl font-semibold text-white">Frequently Asked Questions</h2>
                    <div className="mt-5 space-y-4">
                      {post.faq.map((item) => (
                        <details key={item.question} className="rounded-2xl border border-white/8 bg-slate-950/45 p-5">
                          <summary className="cursor-pointer text-base font-semibold text-white">
                            {item.question}
                          </summary>
                          <p className="mt-3 text-sm leading-7 text-slate-300">{item.answer}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                ) : null}

                <section className="mt-12 border-t border-white/8 pt-8">
                  <h2 className="text-2xl font-semibold text-white">Related content</h2>
                  <div className="mt-5 flex flex-wrap gap-3 text-sm">
                    {(post.categories || []).map((category) => (
                      <Link key={category} href={`/category/${slugify(category)}`} className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                        {category}
                      </Link>
                    ))}
                    {(post.tags || []).map((tag) => (
                      <Link key={tag} href={`/tag/${slugify(tag)}`} className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                        {tag}
                      </Link>
                    ))}
                    {post.author?.name ? (
                      <Link href={`/author/${slugify(post.author?.slug || post.author?.name)}`} className="rounded-full border border-white/8 bg-white/5 px-4 py-2 text-slate-200 transition hover:border-cyan-400/20 hover:bg-cyan-400/10">
                        More by {post.author.name}
                      </Link>
                    ) : null}
                  </div>
                </section>

                <section className="mt-12 border-t border-white/8 pt-8">
                  <SocialShare url={canonicalUrl} title={post.title} />
                </section>
              </div>

              <div className="space-y-6">
                <TableOfContents items={toc} />

                <div className="panel rounded-[1.5rem] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">SEO summary</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <p>Meta title: {post.metaTitle || post.title}</p>
                    <p>Meta description: {post.metaDescription || post.summary}</p>
                    <p>Structured data: Article{post.faq?.length ? ' + FAQ' : ''}</p>
                    <p>Slug: /blog/{post.slug}</p>
                    <p>SEO score: {seoAnalysis.score}/100</p>
                    <p>Meta validation: {seoAnalysis.validation.valid ? 'Pass' : 'Needs attention'}</p>
                  </div>
                  {seoAnalysis.validation.issues.length ? (
                    <ul className="mt-4 space-y-2 text-sm text-rose-200">
                      {seoAnalysis.validation.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  ) : null}
                  {seoAnalysis.validation.warnings.length ? (
                    <ul className="mt-4 space-y-2 text-sm text-amber-200">
                      {seoAnalysis.validation.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="panel rounded-[1.5rem] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Internal links</p>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    {seoAnalysis.internalLinkSuggestions.length ? (
                      seoAnalysis.internalLinkSuggestions.map((suggestion) => (
                        <Link key={suggestion.slug} href={suggestion.href} className="block rounded-2xl border border-white/8 bg-white/5 px-4 py-3 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-white">
                          <div className="font-medium text-white">{suggestion.title}</div>
                          <div className="mt-1 text-xs text-slate-400">{suggestion.reason}</div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-slate-400">No strong internal link suggestions found.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <RelatedPosts posts={relatedPosts} />
        </div>
      </section>
    </article>
  );
}