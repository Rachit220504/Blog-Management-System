import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { createAltTextFallback } from '../lib/seo-tools';

export default function PostContent({ content, fallbackTitle = '', keywords = [] }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'append' }],
      ]}
      components={{
        h2: ({ children, ...props }) => (
          <h2 {...props} className="scroll-mt-28 text-2xl font-semibold text-white">
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 {...props} className="scroll-mt-28 text-xl font-semibold text-white">
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p {...props} className="text-base leading-8 text-slate-300">
            {children}
          </p>
        ),
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={createAltTextFallback({
              alt,
              title: fallbackTitle,
              keywords,
              src,
            })}
            loading="lazy"
            decoding="async"
            className="my-6 h-auto w-full rounded-2xl border border-white/8 object-cover"
          />
        ),
        ul: ({ children, ...props }) => (
          <ul {...props} className="space-y-2 pl-6 text-slate-300">
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol {...props} className="space-y-2 pl-6 text-slate-300">
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li {...props} className="leading-7">
            {children}
          </li>
        ),
        a: ({ children, ...props }) => (
          <a {...props} className="font-medium text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:text-cyan-200">
            {children}
          </a>
        ),
        blockquote: ({ children, ...props }) => (
          <blockquote {...props} className="rounded-2xl border border-cyan-400/15 bg-cyan-400/6 px-5 py-4 text-slate-200">
            {children}
          </blockquote>
        ),
        code: ({ children, className, ...props }) => {
          const isBlock = className?.includes('language-');
          if (isBlock) {
            return (
              <code {...props} className="mono block overflow-x-auto rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm text-slate-200">
                {children}
              </code>
            );
          }

          return (
            <code {...props} className="mono rounded-md bg-slate-950 px-1.5 py-0.5 text-[0.92em] text-amber-200">
              {children}
            </code>
          );
        },
        table: ({ children, ...props }) => (
          <div className="overflow-x-auto rounded-2xl border border-white/8">
            <table {...props} className="w-full border-collapse text-left text-sm text-slate-300">
              {children}
            </table>
          </div>
        ),
        th: ({ children, ...props }) => (
          <th {...props} className="border-b border-white/8 bg-slate-950 px-4 py-3 text-slate-100">
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td {...props} className="border-b border-white/8 px-4 py-3 align-top">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
