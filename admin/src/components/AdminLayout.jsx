import React, { useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, BookOpen, Bell, Search } from 'lucide-react';
import { NAV_ITEMS, PAGE_TITLES } from '../config/navigation';
import { hasPermission } from '../config/permissions';
import { formatRole } from '../utils/formatters';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const allowedMenuItems = useMemo(
    () => NAV_ITEMS.filter((item) => hasPermission(user?.role, item.permission)),
    [user?.role]
  );

  const pageTitle = PAGE_TITLES[location.pathname] || 'Admin';

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
              <div className="hidden w-[280px] items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-500 lg:flex">
                <Search className="h-4 w-4" />
                <span>Quick search not connected</span>
              </div>
              <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
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
    </div>
  );
};

export default AdminLayout;
