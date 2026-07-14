import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

/*
 * Accepts real data as [{ day, revenue }]. Falls back to a flat zeroed
 * week so the chart still renders sensibly before any orders exist.
 */
const WeeklySalesChart = ({ data }) => {
  const chartData = data?.length
    ? data
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, revenue: 0 }));

  return (
    <div className="card">
      <h3 className="font-semibold text-ink-900">Weekly Sales Trend</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#1e66f5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklySalesChart;
