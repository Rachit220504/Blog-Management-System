'use client';

import { useState } from 'react';
import { Mail, MessageSquare, User } from 'lucide-react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Atlas Blog inquiry from ${name || 'Visitor'}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:hello@atlasblog.dev?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="panel rounded-[2rem] p-5 sm:p-6 md:p-8">
      <div className="space-y-5">
        <label className="block text-sm text-slate-200">
          <span className="mb-2 block font-medium">Name</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3">
            <User className="h-4 w-4 text-slate-500" />
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Your name" />
          </div>
        </label>

        <label className="block text-sm text-slate-200">
          <span className="mb-2 block font-medium">Email</span>
          <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3">
            <Mail className="h-4 w-4 text-slate-500" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="you@example.com" />
          </div>
        </label>

        <label className="block text-sm text-slate-200">
          <span className="mb-2 block font-medium">Message</span>
          <div className="rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
              <MessageSquare className="h-4 w-4" />
              Write your message
            </div>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={7} className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" placeholder="Tell us how we can help..." />
          </div>
        </label>

        <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
          Send message
        </button>
      </div>
    </form>
  );
}
