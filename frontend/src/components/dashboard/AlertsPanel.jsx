const AlertsPanel = ({ expired = 0, lowStock = 0, outOfStock = 0 }) => (
  <div className="card">
    <h3 className="font-semibold text-ink-900">Alerts & Notifications</h3>

    <div className="mt-4 space-y-3">
      <div className="rounded-xl bg-rose-50 p-4 text-rose-700">
        <p className="font-medium">⚠️ {expired} Medicine{expired === 1 ? '' : 's'} Expired</p>
        <p className="text-xs opacity-80">Remove immediately</p>
      </div>
      <div className="rounded-xl bg-amber-50 p-4 text-amber-700">
        <p className="font-medium">⚠️ {lowStock} Item{lowStock === 1 ? '' : 's'} Low on Stock</p>
        <p className="text-xs opacity-80">Reorder soon</p>
      </div>
      <div className="rounded-xl bg-slate-100 p-4 text-slate-700">
        <p className="font-medium">📦 {outOfStock} Item{outOfStock === 1 ? '' : 's'} Out of Stock</p>
        <p className="text-xs opacity-80">Restock to reappear in search</p>
      </div>
    </div>
  </div>
);

export default AlertsPanel;
