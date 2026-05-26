import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LockKeyhole, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm } from '../utils/validators';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLoginForm({ email, password });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.10),_transparent_26%)]" />
      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl sm:p-8 lg:p-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              CMS Admin
            </div>
            <h1 className="mt-8 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Manage publishing, SEO, media, and permissions from one control room.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">
              A focused workspace for content teams with role-based navigation, rich editing, and secure JWT login.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              ['Drafts', 'Fast workflow'],
              ['SEO', 'Metadata control'],
              ['Media', 'Upload and reuse'],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/40 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Welcome back</p>
              <h2 className="text-2xl font-semibold text-white">Sign in to continue</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-200">Email</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200">Password</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <LockKeyhole className="h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {errors.password && <p className="mt-2 text-xs text-rose-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Sign In
            </button>
          </form>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-slate-400">
            If you don't have an admin account, contact your system administrator to create one.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
