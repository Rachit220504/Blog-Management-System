import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Activity, FileText, Sparkles, Users, CircleSlash2, Plus, Eye, PenLine } from 'lucide-react';
import { dashboardApi, postsApi } from '../services/api';
import { formatNumber, formatDate, truncate, formatStatusLabel } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const Dashboard = () => {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.stats();
      return response.data.data;
    },
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['dashboard-recent-posts'],
    queryFn: async () => {
      const response = await postsApi.list({ page: 1, limit: 5 });
      return response.data.data;
    },
  });

  const cards = [
    { title: 'Total Articles', value: formatNumber(stats?.posts?.total), icon: FileText, tone: 'from-sky-500 to-cyan-400' },
    { title: 'Published', value: formatNumber(stats?.posts?.published), icon: Sparkles, tone: 'from-emerald-500 to-teal-400' },
    { title: 'Drafts', value: formatNumber(stats?.posts?.drafts), icon: CircleSlash2, tone: 'from-amber-500 to-orange-400' },
    { title: 'Live Views', value: formatNumber(stats?.views), icon: Eye, tone: 'from-violet-500 to-fuchsia-400', hint: 'Auto-refreshing analytics' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.name || 'Admin'}`}
        description="Use this control panel to monitor content, manage workflow, and move quickly between editorial tasks."
        actions={[
          <Link key="create" to="/posts/new" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[0.99] sm:w-auto">
            <Plus className="h-4 w-4" />
            Create Blog
          </Link>,
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Recent Content</p>
              <h3 className="text-lg font-semibold text-white">Latest posts</h3>
            </div>
            <Link to="/posts" className="text-sm text-sky-300 transition hover:text-sky-200">View all</Link>
          </div>
          <div className="divide-y divide-white/10">
            {(recentPosts || []).map((post) => (
              <div key={post._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={post.status === 'published' ? 'success' : 'warning'}>{formatStatusLabel(post.status)}</Badge>
                    {(post.categories || []).slice(0, 2).map((category) => (
                      <Badge key={category}>{category}</Badge>
                    ))}
                  </div>
                  <p className="mt-3 truncate text-base font-medium text-white">{post.title}</p>
                  <p className="mt-1 max-w-2xl text-sm text-slate-400">{truncate(post.summary || post.excerpt, 120)}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{formatDate(post.createdAt)}</span>
                  <Link to={`/posts/${post._id}/edit`} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 transition hover:bg-white/10">
                    <PenLine className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">System</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Your account</h3>
          <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
            <img src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`} alt={user?.name || 'Admin'} className="h-14 w-14 rounded-2xl border border-white/10 object-cover" />
            <div>
              <p className="text-lg font-semibold text-white">{user?.name}</p>
              <p className="text-sm text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <span className="text-slate-400">Role</span>
              <span className="font-medium text-white">{user?.role}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <span className="text-slate-400">Posts in view</span>
              <span className="font-medium text-white">{formatNumber(stats?.posts?.total)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <span className="text-slate-400">Recent activity</span>
              <span className="font-medium text-white">Live</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link to="/posts" className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              <Activity className="h-4 w-4" />
              Inspect posts
            </Link>
            <Link to="/media" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110">
              <Users className="h-4 w-4" />
              Media
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
