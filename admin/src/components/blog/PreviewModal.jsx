import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

const PreviewModal = ({ open, post, onClose }) => {
  return (
    <Modal open={open} title={post?.title || 'Preview'} onClose={onClose}>
      {!post ? (
        <div className="py-20 text-center text-slate-400">Nothing to preview.</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {post.featuredImage && (
              <img src={post.featuredImage} alt={post.title} className="h-72 w-full rounded-3xl object-cover" />
            )}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge tone={post.status === 'published' ? 'success' : 'warning'}>{post.status || 'draft'}</Badge>
                {post.categories?.slice?.(0, 3)?.map((category) => (
                  <Badge key={category}>{category}</Badge>
                ))}
              </div>
              <h4 className="text-2xl font-semibold text-white">{post.title}</h4>
              <p className="text-sm leading-6 text-slate-400">{post.summary || post.excerpt}</p>
            </div>
            <article className="prose prose-invert prose-slate max-w-none rounded-3xl border border-white/10 bg-slate-950/70 p-5 prose-headings:text-white prose-a:text-sky-300" dangerouslySetInnerHTML={{ __html: post.content || '<p>No content available.</p>' }} />
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">SEO</p>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div><span className="text-slate-500">Slug:</span> /{post.slug}</div>
                <div><span className="text-slate-500">Meta Title:</span> {post.metaTitle || post.title}</div>
                <div><span className="text-slate-500">Meta Description:</span> {post.metaDescription || post.summary}</div>
                <div><span className="text-slate-500">Canonical:</span> {post.canonicalUrl || 'Auto generated'}</div>
                <div><span className="text-slate-500">Published:</span> {formatDate(post.publishedAt || post.createdAt)}</div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Keywords</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(post.keywords || []).map((keyword) => (
                  <span key={keyword} className="rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs text-slate-300">{keyword}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PreviewModal;
