const STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  cancelled: 'bg-rose-100 text-rose-700',
  active: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-rose-100 text-rose-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Pending: 'bg-amber-100 text-amber-700',
};

const StatusBadge = ({ status }) => (
  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${STYLES[status] || 'bg-slate-100 text-slate-700'}`}>
    {status}
  </span>
);

export default StatusBadge;
