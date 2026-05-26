const toneMap = {
  success: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  danger: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
  info: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
  neutral: 'border-white/10 bg-white/5 text-slate-300',
};

const Badge = ({ children, tone = 'neutral', className = '' }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${toneMap[tone] || toneMap.neutral} ${className}`}>
    {children}
  </span>
);

export default Badge;
