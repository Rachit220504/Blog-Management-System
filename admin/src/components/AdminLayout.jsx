import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, BookOpen, Bell, Search, ArrowRight } from 'lucide-react';
import { NAV_ITEMS, PAGE_TITLES } from '../config/navigation';
import { hasPermission } from '../config/permissions';
import { formatDate, formatRole, truncate } from '../utils/formatters';
import { dashboardApi, postsApi, taxonomyApi, usersApi } from '../services/api';
import Modal from './ui/Modal';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allowedMenuItems = useMemo(
    () => NAV_ITEMS.filter((item) => hasPermission(user?.role, item.permission)),
    [user?.role]
  );

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
        setNotificationOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const { data: quickSearchPosts } = useQuery({
    queryKey: ['admin-layout-search-posts', searchValue],
    queryFn: async () => (await postsApi.list({ page: 1, limit: 10, search: searchValue })).data,
    enabled: searchOpen && searchValue.trim().length > 0,
  });

  const { data: quickSearchUsers } = useQuery({
    queryKey: ['admin-layout-search-users', searchValue],
    queryFn: async () => (await usersApi.list({ page: 1, limit: 10, search: searchValue })).data,
    enabled: searchOpen && searchValue.trim().length > 0,
  });

  const { data: quickSearchCategories } = useQuery({
    queryKey: ['admin-layout-search-categories'],
    queryFn: async () => (await taxonomyApi.categories()).data.data || [],
    enabled: searchOpen,
  });

  const { data: quickSearchTags } = useQuery({
    queryKey: ['admin-layout-search-tags'],
    queryFn: async () => (await taxonomyApi.tags()).data.data || [],
    enabled: searchOpen,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ['admin-layout-dashboard-stats'],
    queryFn: async () => (await dashboardApi.stats()).data.data,
    enabled: searchOpen || notificationOpen,
  });

  const { data: recentPosts } = useQuery({
    queryKey: ['admin-layout-recent-posts'],
    queryFn: async () => (await postsApi.list({ page: 1, limit: 6 })).data.data || [],
    enabled: notificationOpen || searchOpen,
  });

  const navigationMatches = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    return NAV_ITEMS.filter((item) => hasPermission(user?.role, item.permission))
      .filter((item) => {
        if (!term) return true;
        const pageLabel = PAGE_TITLES[item.path] || item.label;
        return [item.label, pageLabel, item.path].some((value) => String(value).toLowerCase().includes(term));
      })
      .slice(0, 6);
  }, [searchValue, user?.role]);

  const quickResults = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    const posts = (quickSearchPosts?.data || [])
      .filter((post) => {
        if (!term) return true;
        return [post.title, post.slug, post.summary, post.excerpt].some((value) => String(value || '').toLowerCase().includes(term));
      })
      .slice(0, 6);

    const users = (quickSearchUsers?.data || [])
      .filter((item) => {
        if (!term) return true;
        return [item.name, item.email, item.role].some((value) => String(value || '').toLowerCase().includes(term));
      })
      .slice(0, 6);

    const categories = (quickSearchCategories || [])
      .filter((item) => {
        if (!term) return true;
        return String(item).toLowerCase().includes(term);
      })
      .slice(0, 6);

    const tags = (quickSearchTags || [])
      .filter((item) => {
        if (!term) return true;
        return String(item).toLowerCase().includes(term);
      })
      .slice(0, 6);

    return { posts, users, categories, tags };
  }, [searchValue, quickSearchPosts, quickSearchUsers, quickSearchCategories, quickSearchTags]);

  const notificationItems = useMemo(() => {
    const items = [];
    const drafts = (recentPosts || []).filter((post) => post.status === 'draft').slice(0, 3);
    const published = (recentPosts || []).filter((post) => post.status === 'published').slice(0, 3);

    if ((dashboardStats?.posts?.drafts || 0) > 0) {
      items.push({
        id: 'draft-summary',
        tone: 'warning',
        title: `${dashboardStats.posts.drafts} draft${dashboardStats.posts.drafts === 1 ? '' : 's'} need review`,
        description: 'Open the blog list to review unpublished content.',
        meta: 'Content pipeline',
      });
    }

    drafts.forEach((post) => {
      items.push({
        id: post._id,
        tone: 'warning',
        title: 'Draft waiting for review',
        description: post.title,
        meta: formatDate(post.updatedAt || post.createdAt),
        action: { label: 'Open draft', to: `/posts/${post._id}/edit` },
      });
    });

    published.forEach((post) => {
      items.push({
        id: post._id,
        tone: 'success',
        title: 'Recently published',
        description: post.title,
        meta: formatDate(post.updatedAt || post.createdAt),
        action: { label: 'Open post', to: `/posts/${post._id}/edit` },
      });
    });

    if (!items.length) {
      items.push({
        id: 'empty',
        tone: 'neutral',
        title: 'All caught up',
        description: 'No recent content activity needs attention right now.',
        meta: 'No notifications',
      });
    }

    return items.slice(0, 6);
  }, [dashboardStats, recentPosts]);

  const openSearch = () => {
    setSearchValue('');
    setSearchOpen(true);
  };

  const handleSearchSelect = (target) => {
    setSearchOpen(false);
    setSearchValue('');
    navigate(target);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1)_0%,_rgba(3,7,18,1)_100%)]" />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[86vw] max-w-72 border-r border-white/10 bg-slate-950/90 backdrop-blur-xl transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 shadow-lg shadow-cyan-500/20">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admin</p>
            <h1 className="text-lg font-semibold text-white">Blog Control</h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {allowedMenuItems.map((item) => {
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white ring-1 ring-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Signed in as</p>
            <div className="mt-3 flex items-center gap-3">
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`}
                alt={user?.name || 'Admin'}
                className="h-11 w-11 rounded-2xl border border-white/10 bg-slate-900 object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-slate-400">{formatRole(user?.role || 'user')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar" />
      )}

      <div className="flex min-h-screen flex-col md:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
          <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-start gap-3 sm:items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 md:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{formatRole(user?.role || 'user')}</p>
                <h2 className="text-xl font-semibold text-white sm:text-2xl">{pageTitle}</h2>
              </div>
            </div>

            <div className="flex w-full items-center gap-3 sm:w-auto sm:justify-end">
              <button type="button" onClick={openSearch} className="hidden w-[280px] items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-500 transition hover:border-cyan-400/30 hover:bg-white/10 lg:flex">
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left">Quick search</span>
                <span className="rounded-full border border-white/10 bg-slate-950/80 px-2 py-0.5 text-[10px] uppercase tracking-[0.24em] text-slate-500">Ctrl K</span>
              </button>
              <button onClick={() => setNotificationOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10" aria-label="Open notifications">
                <Bell className="h-5 w-5" />
              </button>
              <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 sm:flex">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Admin'}`}
                  alt={user?.name || 'Admin'}
                  className="h-8 w-8 rounded-xl border border-white/10 bg-slate-900 object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-slate-400">{formatRole(user?.role || 'user')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-rose-500/10 hover:text-rose-200"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      <Modal open={searchOpen} title="Quick Search" onClose={() => setSearchOpen(false)}>
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              autoFocus
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search posts, users, categories, tags, or pages..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Navigation</p>
              <div className="space-y-2">
                {navigationMatches.length ? navigationMatches.map((item) => (
                  <button key={item.path} onClick={() => handleSearchSelect(item.path)} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.path}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                )) : <p className="text-sm text-slate-500">No matching pages.</p>}
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Content</p>
              <div className="space-y-2">
                {(quickResults.posts.length || quickResults.users.length || quickResults.categories.length || quickResults.tags.length) ? null : (
                  <p className="text-sm text-slate-500">Type at least one character to search content.</p>
                )}
                {quickResults.posts.map((post) => (
                  <button key={post._id} onClick={() => handleSearchSelect(`/posts/${post._id}/edit`)} className="flex w-full items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{post.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{truncate(post.summary || post.excerpt || post.slug, 90)}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-400">Post</span>
                  </button>
                ))}
                {quickResults.users.map((item) => (
                  <button key={item._id} onClick={() => handleSearchSelect('/users')} className="flex w-full items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.email} · {item.role}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-400">User</span>
                  </button>
                ))}
                {quickResults.categories.map((item) => (
                  <button key={item} onClick={() => handleSearchSelect('/categories')} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                    <span className="text-sm font-medium text-white">{item}</span>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-400">Category</span>
                  </button>
                ))}
                {quickResults.tags.map((item) => (
                  <button key={item} onClick={() => handleSearchSelect('/tags')} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                    <span className="text-sm font-medium text-white">{item}</span>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-400">Tag</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={notificationOpen} title="Notifications" onClose={() => setNotificationOpen(false)}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Posts</p>
              <p className="mt-2 text-2xl font-semibold text-white">{dashboardStats?.posts?.total ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Drafts</p>
              <p className="mt-2 text-2xl font-semibold text-white">{dashboardStats?.posts?.drafts ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Views</p>
              <p className="mt-2 text-2xl font-semibold text-white">{dashboardStats?.views ?? 0}</p>
            </div>
          </div>

          <div className="space-y-3">
            {notificationItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.description}</p>
                  <p className="mt-2 text-xs text-slate-500">{item.meta}</p>
                </div>
                {item.action ? (
                  <button onClick={() => {
                    setNotificationOpen(false);
                    navigate(item.action.to);
                  }} className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                    {item.action.label}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminLayout;
