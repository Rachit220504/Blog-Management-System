import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Save, Sparkles } from 'lucide-react';
import { postsApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import FormField, { inputClass } from '../components/ui/FormField';
import SeoScoreCard from '../components/blog/SeoScoreCard';
import { buildCanonicalUrlFromTitle, buildSlugFromText, isAutoCanonicalUrlManaged, resolveCanonicalUrl, resolveSlug, seoScoreFromPost, splitList, slugify } from '../utils/content';
import { validateSeoForm } from '../utils/validators';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

const SeoEditor = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ metaTitle: '', metaDescription: '', canonicalUrl: '', keywords: '', ogTitle: '', ogDescription: '', ogImage: '', slug: '', title: '', summary: '', featuredImage: '' });
  const [errors, setErrors] = useState({});

  const { data } = useQuery({
    queryKey: ['seo-posts', search],
    queryFn: async () => (await postsApi.list({ page: 1, limit: 50, search })).data.data,
  });

  const selectedPostQuery = useQuery({
    queryKey: ['seo-post', selectedId],
    queryFn: async () => (await postsApi.get(selectedId)).data.data,
    enabled: Boolean(selectedId),
  });

  useEffect(() => {
    const post = selectedPostQuery.data;
    if (post) {
      setForm({
        title: post.title || '',
        slug: post.slug || buildSlugFromText(post.metaTitle || post.title),
        summary: post.summary || post.excerpt || '',
        featuredImage: post.featuredImage || post.featureImage || '',
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        canonicalUrl: post.canonicalUrl || buildCanonicalUrlFromTitle(post.metaTitle || post.title),
        keywords: (post.keywords || []).join(', '),
        ogTitle: post.ogTitle || '',
        ogDescription: post.ogDescription || '',
        ogImage: post.ogImage || '',
      });
    }
  }, [selectedPostQuery.data]);

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
    setForm((current) => ({
      ...current,
      canonicalUrl: event.target.value,
    }));
  };

  const seoScore = useMemo(() => seoScoreFromPost({
    title: form.title,
    summary: form.summary,
    slug: form.slug,
    featuredImage: form.featuredImage,
    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    keywords: splitList(form.keywords),
  }), [form]);

  const saveMutation = useMutation({
    mutationFn: async () => postsApi.update(selectedId, {
      ...(selectedPostQuery.data || {}),
      slug: resolveSlug({
        slug: form.slug,
        title: form.title,
        metaTitle: form.metaTitle || form.title,
      }),
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
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['seo-posts'] });
      toast.success('SEO fields saved');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'SEO save failed'),
  });

  const checklist = [
    { label: 'Meta title', pass: Boolean(form.metaTitle) },
    { label: 'Meta description', pass: Boolean(form.metaDescription) },
    { label: 'Canonical URL', pass: Boolean(form.canonicalUrl) },
    { label: 'Keywords', pass: splitList(form.keywords).length > 0 },
  ];

  const canonicalStatus = isAutoCanonicalUrlManaged(form.canonicalUrl, [form.metaTitle, form.title])
    ? `Auto-generated from ${form.metaTitle ? 'meta title' : 'title'}`
    : 'Manually edited';

  const handleSubmit = () => {
    const formErrors = validateSeoForm(form);
    setErrors(formErrors);
    if (Object.keys(formErrors).length) return;
    saveMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="SEO"
        title="SEO Editor"
        description="Tune metadata, social cards, and canonical URLs without opening the full blog editor."
        actions={[
          <button key="save" onClick={handleSubmit} disabled={!selectedId} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">
            <Save className="h-4 w-4" />
            Save SEO
          </button>,
        ]}
      />

      <Card className="p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <Search className="h-4 w-4 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search posts to edit SEO" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Posts</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Choose an article</h3>
          </div>
          <div className="max-h-[70vh] divide-y divide-white/10 overflow-y-auto">
            {(data || []).map((post) => (
              <button key={post._id} onClick={() => setSelectedId(post._id)} className={`block w-full px-5 py-4 text-left transition ${selectedId === post._id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{post.title}</p>
                    <p className="mt-1 text-xs text-slate-500 mono">/{post.slug}</p>
                  </div>
                  <Badge tone={post.status === 'published' ? 'success' : 'warning'}>{post.status}</Badge>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <SeoScoreCard score={seoScore} checklist={checklist} />
          <Card className="p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              <FormField label="Meta Title" error={errors.metaTitle} required>
                <input value={form.metaTitle} onChange={handleMetaTitleChange} className={inputClass} />
              </FormField>
              <FormField label="Canonical URL" error={errors.canonicalUrl} hint={canonicalStatus}>
                <input value={form.canonicalUrl} onChange={handleCanonicalChange} className={inputClass} />
              </FormField>
              <FormField label="Meta Description" error={errors.metaDescription} required>
                <textarea rows={4} value={form.metaDescription} onChange={(event) => setForm((current) => ({ ...current, metaDescription: event.target.value }))} className={inputClass} />
              </FormField>
              <FormField label="Keywords">
                <input value={form.keywords} onChange={(event) => setForm((current) => ({ ...current, keywords: event.target.value }))} className={inputClass} />
              </FormField>
              <FormField label="OG Title">
                <input value={form.ogTitle} onChange={(event) => setForm((current) => ({ ...current, ogTitle: event.target.value }))} className={inputClass} />
              </FormField>
              <FormField label="OG Image">
                <input value={form.ogImage} onChange={(event) => setForm((current) => ({ ...current, ogImage: event.target.value }))} className={inputClass} />
              </FormField>
              <FormField label="OG Description" className="lg:col-span-2">
                <textarea rows={4} value={form.ogDescription} onChange={(event) => setForm((current) => ({ ...current, ogDescription: event.target.value }))} className={inputClass} />
              </FormField>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeoEditor;
