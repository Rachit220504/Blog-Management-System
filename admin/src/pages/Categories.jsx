import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Categories = () => {
  const [search, setSearch] = useState('');
  const { data: categories } = useQuery({ queryKey: ['taxonomy-categories'], queryFn: async () => (await postsApi.categories()).data.data });
  const { data: posts } = useQuery({ queryKey: ['taxonomy-category-posts'], queryFn: async () => (await postsApi.list({ page: 1, limit: 200 })).data.data });

  const counts = useMemo(() => {
    const map = new Map();
    (posts || []).forEach((post) => {
      (post.categories || []).forEach((category) => map.set(category, (map.get(category) || 0) + 1));
    });
    return map;
  }, [posts]);

  const list = (categories || []).filter((category) => category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Taxonomy" title="Categories" description="Review the category vocabulary in use and jump into filtered posts quickly." />
      <Card className="p-4">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search categories" className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((category) => (
          <Card key={category} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{category}</p>
                <p className="mt-1 text-sm text-slate-400">{counts.get(category) || 0} posts</p>
              </div>
              <Badge tone="info">Category</Badge>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <Link to={`/posts?category=${encodeURIComponent(category)}`} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition hover:bg-white/10">Open posts</Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Categories;
