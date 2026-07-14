export const SkeletonRow = () => (
  <div className="grid grid-cols-6 items-center gap-4 border-b border-slate-100 p-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="skeleton h-4 w-full" />
    ))}
  </div>
);

export const SkeletonCard = () => (
  <div className="card space-y-3">
    <div className="skeleton h-4 w-1/3" />
    <div className="skeleton h-8 w-1/2" />
    <div className="skeleton h-3 w-2/3" />
  </div>
);
