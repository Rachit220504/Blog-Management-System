import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, Plus, Search, Eye, PencilLine, Trash2, Shuffle, CornerDownRight } from 'lucide-react';
import { postsApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import PreviewModal from '../components/blog/PreviewModal';
import { formatDate, formatNumber, truncate } from '../utils/formatters';
import toast from 'react-hot-toast';

const statusOptions = ['', 'draft', 'published'];

const PostList = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [previewPost, setPreviewPost] = useState(null);
  const limit = 8;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts', page, search, status, category, tag],
    queryFn: async () => {
      const response = await postsApi.list({ page, limit, search, status, category, tag });
      return response.data;
    },
    placeholderData: (previous) => previous,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin-post-categories'],
    queryFn: async () => (await postsApi.categories()).data.data,
  });

  const { data: tagsData } = useQuery({
    queryKey: ['admin-post-tags'],
    queryFn: async () => (await postsApi.tags()).data.data,
  });

  useEffect(() => {
    const nextSearch = searchParams.get('search') || '';
    const nextCategory = searchParams.get('category') || '';
    const nextTag = searchParams.get('tag') || '';
    const nextStatus = searchParams.get('status') || '';

    setSearch(nextSearch);
    setCategory(nextCategory);
    setTag(nextTag);
    setStatus(nextStatus);
  }, [searchParams]);

  const syncQuery = (nextValues) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });

    setSearchParams(next, { replace: true });
  };

  const previewMutation = useMutation({
    mutationFn: async (id) => {
      const response = await postsApi.preview(id);
      return response.data.data;
    },
    onSuccess: (post) => setPreviewPost(post),
    onError: (error) => toast.error(error.response?.data?.message || 'Preview failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => postsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Post deleted');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Delete failed'),
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, status: nextStatus }) => {
      return nextStatus === 'published' ? postsApi.publish(id) : postsApi.draft(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Status updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Status update failed'),
  });

  const posts = data?.data || [];
  const pagination = data?.pagination || { pages: 1, total: 0 };

  const taxonomyCounts = useMemo(() => ({
    categories: categoriesData || [],
    tags: tagsData || [],
  }), [categoriesData, tagsData]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Blog List"
        description="Search, filter, preview, publish, or remove posts from a single table view."
        actions={[
          <Link key="new-post" to="/posts/new" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950">
            <Plus className="h-4 w-4" />
            Create Blog
          </Link>,
        ]}
      />

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); syncQuery({ search: event.target.value }); }} placeholder="Search title, excerpt, or content" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </div>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); syncQuery({ status: event.target.value }); }} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            {statusOptions.map((item) => <option key={item || 'all'} value={item}>{item ? item.charAt(0).toUpperCase() + item.slice(1) : 'All Statuses'}</option>)}
          </select>
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); syncQuery({ category: event.target.value }); }} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="">All Categories</option>
            {(taxonomyCounts.categories || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={tag} onChange={(event) => { setTag(event.target.value); setPage(1); syncQuery({ tag: event.target.value }); }} className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none">
            <option value="">All Tags</option>
            {(taxonomyCounts.tags || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {isLoading && !posts.length ? (
          <div className="p-16 text-center text-slate-400">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center text-slate-400">No posts found.</div>
        ) : (
          <div className="overflow-x-auto hide-scrollbar">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/5 text-xs uppercase tracking-[0.22em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Post</th>
                  <th className="px-5 py-4">Author</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Categories</th>
                  <th className="px-5 py-4">Views</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {posts.map((post) => (
                  <tr key={post._id} className="transition hover:bg-white/5">
                    <td className="px-5 py-4">
                      <p className="max-w-md font-medium text-white">{post.title}</p>
                      <p className="mt-1 text-xs text-slate-500 mono">/{post.slug}</p>
                      <p className="mt-2 max-w-xl text-sm text-slate-400">{truncate(post.summary || post.excerpt, 110)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{post.author?.name || 'Unknown'}</td>
                    <td className="px-5 py-4">
                      <Badge tone={post.status === 'published' ? 'success' : 'warning'}>{post.status}</Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{(post.categories || []).slice(0, 2).join(', ') || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{formatNumber(post.views)}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{formatDate(post.updatedAt || post.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => previewMutation.mutate(post._id)} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10" title="Preview">
                          <Eye className="h-4 w-4" />
                        </button>
                        <Link to={`/posts/${post._id}/edit`} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10" title="Edit">
                          <PencilLine className="h-4 w-4" />
                        </Link>
                        <button onClick={() => publishMutation.mutate({ id: post._id, status: post.status === 'published' ? 'draft' : 'published' })} className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10" title="Toggle publish">
                          <Shuffle className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(post._id)} className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-200 transition hover:bg-rose-500/20" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Page {page} of {pagination.pages} · {formatNumber(pagination.total)} posts
          </span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-40">
              Prev
            </button>
            <button disabled={page >= pagination.pages} onClick={() => setPage((current) => current + 1)} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </Card>

      <PreviewModal open={Boolean(previewPost)} post={previewPost} onClose={() => setPreviewPost(null)} />
    </div>
  );
};

export default PostList;
