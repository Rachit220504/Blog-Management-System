import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Tags = () => {
  const [search, setSearch] = useState('');
  const { data: tags } = useQuery({ queryKey: ['taxonomy-tags'], queryFn: async () => (await postsApi.tags()).data.data });
  const { data: posts } = useQuery({ queryKey: ['taxonomy-tag-posts'], queryFn: async () => (await postsApi.list({ page: 1, limit: 200 })).data.data });

  const counts = useMemo(() => {
    const map = new Map();
    (posts || []).forEach((post) => {
      (post.tags || []).forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1));
    });
    return map;
  }, [posts]);

  const list = (tags || []).filter((tag) => tag.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Taxonomy" title="Tags" description="Review tags in use and move into the blog list filtered by tag." />
      <Card className="p-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tags" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((tag) => (
          <Card key={tag} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{tag}</p>
                <p className="mt-1 text-sm text-slate-400">{counts.get(tag) || 0} posts</p>
              </div>
              <Badge tone="neutral">Tag</Badge>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Link to={`/posts?tag=${encodeURIComponent(tag)}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10">Open posts</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tags;
