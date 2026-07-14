const STEPS = ['pending', 'accepted', 'dispatched', 'delivered'];

const OrderTimeline = ({ timeline = [], status }) => {
  const isTerminalNegative = ['rejected', 'cancelled'].includes(status);

  if (isTerminalNegative) {
    const event = timeline[timeline.length - 1];
    return (
      <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
        {status === 'cancelled' ? 'Cancelled' : 'Rejected'}
        {event?.note ? ` — ${event.note}` : ''}
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => (
        <div key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                i <= currentIndex ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i <= currentIndex ? '✓' : i + 1}
            </div>
            <span className="mt-1 text-[10px] capitalize text-ink-500">{step}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 ${i < currentIndex ? 'bg-brand-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
