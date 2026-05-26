import Card from './Card';

const StatCard = ({ title, value, icon: Icon, hint, tone = 'from-sky-500 to-cyan-400' }) => {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">{value}</p>
          {hint && <p className="mt-2 text-xs text-slate-500">{hint}</p>}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg shadow-cyan-500/20`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
