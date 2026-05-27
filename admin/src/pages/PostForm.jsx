import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Eye, Send, Sparkles, CircleSlash2, RefreshCw } from 'lucide-react';
import { mediaApi, postsApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import FormField, { inputClass } from '../components/ui/FormField';
import RichTextEditor from '../components/blog/RichTextEditor';
import SeoScoreCard from '../components/blog/SeoScoreCard';
import PreviewModal from '../components/blog/PreviewModal';
import { buildCanonicalUrlFromTitle, buildPreviewUrl, buildSlugFromText, estimateReadTime, isAutoCanonicalUrlManaged, resolveCanonicalUrl, resolveSlug, seoScoreFromPost, slugify, splitList } from '../utils/content';
import { validateBlogForm, validateSeoForm, validateUrl } from '../utils/validators';
import toast from 'react-hot-toast';

const initialForm = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  featuredImage: '',
  status: 'draft',
  tags: '',
  categories: '',
  metaTitle: '',
  metaDescription: '',
  canonicalUrl: '',
  keywords: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
};

const PostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);
  const [activeTab, setActiveTab] = useState('content');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [previewPost, setPreviewPost] = useState(null);
  const [uploading, setUploading] = useState(false);

  const { data: post } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: async () => (await postsApi.get(id)).data.data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || '',
        slug: post.slug || buildSlugFromText(post.metaTitle || post.title),
        summary: post.summary || post.excerpt || '',
        content: post.content || '',
        featuredImage: post.featuredImage || post.featureImage || '',
        status: post.status || 'draft',
        tags: (post.tags || []).join(', '),
        categories: (post.categories || []).join(', '),
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        canonicalUrl: post.canonicalUrl || buildCanonicalUrlFromTitle(post.metaTitle || post.title),
        keywords: (post.keywords || []).join(', '),
        ogTitle: post.ogTitle || '',
        ogDescription: post.ogDescription || '',
        ogImage: post.ogImage || '',
      });
    }
  }, [post]);

  const seoScore = useMemo(() => seoScoreFromPost({
    title: form.title,
    summary: form.summary,
    slug: form.slug,
    featuredImage: form.featuredImage,
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    keywords: splitList(form.keywords),
  }), [form]);

  const checklist = useMemo(() => [
    { label: 'Title length', pass: form.title.length >= 20 && form.title.length <= 70 },
    { label: 'Meta title', pass: Boolean(form.metaTitle) },
    { label: 'Meta description', pass: Boolean(form.metaDescription) },
    { label: 'Canonical URL', pass: !form.canonicalUrl || validateUrl(form.canonicalUrl) },
    { label: 'Featured image', pass: Boolean(form.featuredImage) },
  ], [form]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      return isEdit ? postsApi.update(id, payload) : postsApi.create(payload);
    },
    onSuccess: async () => {
      toast.success(isEdit ? 'Blog updated' : 'Blog created');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate('/posts');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Save failed'),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      // For existing posts, call the dedicated publish endpoint to avoid full payload validation errors.
      if (isEdit) {
        return postsApi.publish(id);
      }

      const payload = buildPayload('published');
      return postsApi.create(payload);
    },
    onSuccess: () => {
      toast.success('Published successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      navigate('/posts');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Publish failed'),
  });

  const buildPayload = (nextStatus = form.status) => ({
    title: form.title.trim(),
    slug: resolveSlug({
      slug: form.slug,
      title: form.title,
      metaTitle: form.metaTitle || form.title,
    }),
    summary: form.summary.trim(),
    content: form.content,
    status: nextStatus,
    featuredImage: form.featuredImage,
    featuredImageUrl: form.featuredImage,
    tags: splitList(form.tags),
    categories: splitList(form.categories),
    metaTitle: form.metaTitle || form.title,
    metaDescription: form.metaDescription || form.summary,
    canonicalUrl: resolveCanonicalUrl({
      canonicalUrl: form.canonicalUrl,
      metaTitle: form.metaTitle || form.title,
      title: form.title,
    }),
    keywords: splitList(form.keywords),
    ogTitle: form.ogTitle || form.metaTitle || form.title,
    ogDescription: form.ogDescription || form.metaDescription || form.summary,
    ogImage: form.ogImage || form.featuredImage,
  });

  const handleField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleTitleChange = (event) => {
    const nextTitle = event.target.value;

    setForm((current) => {
      const nextState = {
        ...current,
        title: nextTitle,
        slug: buildSlugFromText(nextTitle || current.metaTitle || current.title),
        canonicalUrl: buildCanonicalUrlFromTitle(nextTitle || current.metaTitle || current.title),
      };

      return nextState;
    });
  };

  const handleMetaTitleChange = (event) => {
    const nextMetaTitle = event.target.value;

    setForm((current) => {
      const nextState = {
        ...current,
        metaTitle: nextMetaTitle,
        slug: buildSlugFromText(nextMetaTitle || current.title),
        canonicalUrl: buildCanonicalUrlFromTitle(nextMetaTitle || current.title),
      };

      return nextState;
    });
  };

  const handleCanonicalChange = (event) => {
    const nextCanonicalUrl = event.target.value;

    setForm((current) => ({
      ...current,
      canonicalUrl: nextCanonicalUrl,
    }));
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const response = await mediaApi.uploadFeatureImage(formData);
      const url = response.data.data.url || response.data.data.secureUrl;
      setForm((current) => ({ ...current, featuredImage: url, ogImage: url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (nextStatus = form.status) => {
    const payload = buildPayload(nextStatus);
    const formErrors = { ...validateBlogForm(payload), ...validateSeoForm(payload) };
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;
    saveMutation.mutate(payload);
  };

  const previewData = buildPayload(form.status);
  const canonicalStatus = isAutoCanonicalUrlManaged(form.canonicalUrl, [form.metaTitle, form.title])
    ? `Auto-generated from ${form.metaTitle ? 'meta title' : 'title'}`
    : 'Manually edited';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={() => navigate('/posts')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={form.status === 'published' ? 'success' : 'warning'}>{form.status}</Badge>
          <Badge>{estimateReadTime(form.content)} min read</Badge>
          <Badge>{seoScore}/100 SEO</Badge>
        </div>
      </div>

      <PageHeader
        eyebrow={isEdit ? 'Edit Blog' : 'Create Blog'}
        title={form.title || 'Untitled article'}
        description="Write content, manage SEO, attach images, preview the article, and publish or save as draft."
        actions={[
          <button key="preview" onClick={() => setPreviewPost(previewData)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto">
            <Eye className="h-4 w-4" />
            Preview
          </button>,
          <button key="draft" onClick={() => handleSubmit('draft')} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 sm:w-auto">
            <CircleSlash2 className="h-4 w-4" />
            Save Draft
          </button>,
          <button key="publish" onClick={() => publishMutation.mutate()} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[0.99] sm:w-auto">
            <Send className="h-4 w-4" />
            Publish
          </button>,
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
              {['content', 'seo', 'publish'].map((tab) => (
                <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${activeTab === tab ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-5">
              {(activeTab === 'content' || activeTab === 'publish') && (
                <>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <FormField label="Title" error={errors.title} required>
                      <input value={form.title} onChange={handleTitleChange} className={inputClass} placeholder="A clear, search-friendly title" />
                    </FormField>
                    <FormField label="Slug" error={errors.slug} required hint={isAutoSlugManaged(form.slug, [form.title, form.metaTitle]) ? 'Auto-generated from title/meta title' : 'Manually edited'}>
                      <input value={form.slug} onChange={handleField('slug')} className={inputClass} placeholder="seo-friendly-url" />
                    </FormField>
                  </div>

                  <FormField label="Summary" error={errors.summary} required hint="Keep it concise for cards, previews, and search snippets.">
                    <textarea rows={4} value={form.summary} onChange={handleField('summary')} className={inputClass} placeholder="Short summary for the blog card and meta description" />
                  </FormField>

                  <FormField label="Featured Image" error={errors.featuredImage} hint="Paste a URL or upload a local image.">
                    <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                      <input value={form.featuredImage} onChange={handleField('featuredImage')} className={inputClass} placeholder="https://..." />
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                        <Upload className="h-4 w-4" />
                        {uploading ? 'Uploading...' : 'Upload'}
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                      </label>
                    </div>
                  </FormField>

                  <FormField label="Content" error={errors.content} required>
                    <RichTextEditor value={form.content} onChange={(value) => setForm((current) => ({ ...current, content: value }))} />
                  </FormField>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <FormField label="Tags" hint="Comma-separated tags used for discovery.">
                      <input value={form.tags} onChange={handleField('tags')} className={inputClass} placeholder="nextjs, seo, performance" />
                    </FormField>
                    <FormField label="Categories" hint="Comma-separated categories for grouping.">
                      <input value={form.categories} onChange={handleField('categories')} className={inputClass} placeholder="guides, tutorials" />
                    </FormField>
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <FormField label="Meta Title" error={errors.metaTitle} required>
                    <input value={form.metaTitle} onChange={handleMetaTitleChange} className={inputClass} placeholder="Primary SEO title" />
                  </FormField>
                  <FormField label="Canonical URL" error={errors.canonicalUrl} hint={canonicalStatus}>
                    <input value={form.canonicalUrl} onChange={handleCanonicalChange} className={inputClass} placeholder="https://your-site.com/blog/my-post" />
                  </FormField>
                  <FormField label="Meta Description" error={errors.metaDescription} required>
                    <textarea rows={4} value={form.metaDescription} onChange={handleField('metaDescription')} className={inputClass} placeholder="Search snippet description" />
                  </FormField>
                  <FormField label="Keywords">
                    <input value={form.keywords} onChange={handleField('keywords')} className={inputClass} placeholder="keyword one, keyword two" />
                  </FormField>
                  <FormField label="OG Title">
                    <input value={form.ogTitle} onChange={handleField('ogTitle')} className={inputClass} placeholder="Social share title" />
                  </FormField>
                  <FormField label="OG Image">
                    <input value={form.ogImage} onChange={handleField('ogImage')} className={inputClass} placeholder="Social share image URL" />
                  </FormField>
                  <FormField label="OG Description" className="lg:col-span-2">
                    <textarea rows={4} value={form.ogDescription} onChange={handleField('ogDescription')} className={inputClass} placeholder="Social share description" />
                  </FormField>
                </div>
              )}

              {activeTab === 'publish' && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <FormField label="Publishing State" required>
                    <select value={form.status} onChange={handleField('status')} className={inputClass}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </FormField>
                  <FormField label="Preview URL">
                    <input readOnly value={buildPreviewUrl(form.slug || slugify(form.title || 'post'))} className={inputClass} />
                  </FormField>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <SeoScoreCard score={seoScore} checklist={checklist} />
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Actions</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <button onClick={() => handleSubmit('draft')} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                <span className="inline-flex items-center gap-2"><Save className="h-4 w-4" /> Save draft</span>
                <RefreshCw className="h-4 w-4 text-slate-500" />
              </button>
              <button onClick={() => publishMutation.mutate()} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                <span className="inline-flex items-center gap-2"><Send className="h-4 w-4" /> Publish now</span>
                <Sparkles className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <PreviewModal open={Boolean(previewPost)} post={previewPost} onClose={() => setPreviewPost(null)} />
    </div>
  );
};

export default PostForm;
