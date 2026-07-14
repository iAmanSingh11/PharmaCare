const StarRating = ({ value = 0, count, size = 'text-sm', interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(s)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <span className={s <= Math.round(value) ? 'text-amber-400' : 'text-slate-300'}>★</span>
        </button>
      ))}
      {typeof count === 'number' && <span className="ml-1 text-xs text-ink-500">({count})</span>}
    </div>
  );
};

export default StarRating;
