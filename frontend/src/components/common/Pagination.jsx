const Pagination = ({ page, limit, total, onPageChange }) => {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
      <span className="text-ink-500">
        Page {page} of {totalPages} &middot; {total} results
      </span>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
