const InventoryTable = ({ medicines, onEdit, onDelete }) => {
  const isExpired = (date) => new Date(date) < new Date();
  const daysLeft = (date) => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="grid grid-cols-7 gap-4 bg-brand-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-700">
        <span className="col-span-2">Medicine</span>
        <span>Category</span>
        <span>Stock</span>
        <span>Price</span>
        <span>Expiry</span>
        <span>Actions</span>
      </div>

      {medicines.map((med) => {
        const expired = isExpired(med.expiryDate);
        const left = daysLeft(med.expiryDate);
        const lowStock = med.stockQuantity > 0 && med.stockQuantity <= (med.lowStockThreshold || 10);
        const outOfStock = med.stockQuantity === 0;

        return (
          <div key={med._id} className="grid grid-cols-7 items-center gap-4 border-b border-slate-100 px-4 py-3 text-sm">
            <div className="col-span-2">
              <p className="font-medium text-ink-900">{med.name}</p>
              <p className="text-xs text-ink-500">Batch: {med.batchNumber}</p>
            </div>

            <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs">{med.category}</span>

            <div>
              <p className="font-medium">{med.stockQuantity}</p>
              <p className="text-xs text-ink-500">Min: {med.lowStockThreshold}</p>
            </div>

            <p className="font-medium">₹{Number(med.sellingPrice).toFixed(2)}</p>

            <div>
              <p className={expired ? 'font-medium text-rose-600' : ''}>
                {new Date(med.expiryDate).toLocaleDateString()}
              </p>
              {!expired && left <= 30 && <p className="text-xs text-amber-600">{left} days left</p>}
              {expired && <p className="text-xs text-rose-500">Expired</p>}
            </div>

            <div className="flex items-center gap-3">
              {outOfStock ? (
                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700">Out of Stock</span>
              ) : lowStock ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">Low Stock</span>
              ) : (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">In Stock</span>
              )}
              <button onClick={() => onEdit(med)} title="Edit" className="text-ink-500 hover:text-brand-500">✏️</button>
              <button onClick={() => onDelete(med)} title="Delete" className="text-ink-500 hover:text-rose-500">🗑️</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default InventoryTable;
