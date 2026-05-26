import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="mb-2 text-2xl font-semibold text-white">Access Denied</h3>
        <p className="mb-6 text-sm leading-relaxed text-slate-400">
          You do not have the required authorization permissions to access this screen. If you believe this is an error, please contact your system administrator.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
