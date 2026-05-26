import Card from '../ui/Card';
import Badge from '../ui/Badge';

const SeoScoreCard = ({ score = 0, checklist = [] }) => {
  const tone = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger';

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">SEO Score</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-4xl font-semibold text-white">{score}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
        </div>
        <Badge tone={tone}>{tone}</Badge>
      </div>
      <div className="mt-5 space-y-2">
        {checklist.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
            <span className="text-slate-300">{item.label}</span>
            <span className={item.pass ? 'text-emerald-300' : 'text-slate-500'}>{item.pass ? 'Done' : 'Missing'}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SeoScoreCard;
