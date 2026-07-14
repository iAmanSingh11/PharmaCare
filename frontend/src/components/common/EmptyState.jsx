const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
    <span className="text-4xl">{icon}</span>
    <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export default EmptyState;
