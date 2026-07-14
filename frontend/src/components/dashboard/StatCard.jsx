const StatCard = ({ icon, label, value, accent = 'brand', trend }) => {
  const accents = {
    brand: { chip: 'bg-brand-50 text-brand-600', border: 'border-l-brand-500' },
    emerald: { chip: 'bg-emerald-50 text-emerald-600', border: 'border-l-emerald-500' },
    amber: { chip: 'bg-amber-50 text-amber-600', border: 'border-l-amber-500' },
    rose: { chip: 'bg-rose-50 text-rose-600', border: 'border-l-rose-500' },
  };
  const a = accents[accent];

  return (
    <div className={`card flex items-center justify-between border-l-4 ${a.border}`}>
      <div>
        <p className="text-sm text-ink-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-ink-900">{value}</p>
        {trend && <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${a.chip}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
