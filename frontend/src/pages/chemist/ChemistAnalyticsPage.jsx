import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { medicineApi } from '../../api/medicine.api';
import { orderApi } from '../../api/order.api';
import StatCard from '../../components/dashboard/StatCard';
import WeeklySalesChart from '../../components/dashboard/WeeklySalesChart';

const COLORS = ['#f59e0b', '#1e66f5', '#ef4444', '#94a3b8'];

const ChemistAnalyticsPage = () => {
  const { data: summary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => medicineApi.summary().then((r) => r.data.data),
  });

  const { data: orders } = useQuery({
    queryKey: ['shop-orders', { limit: 200 }],
    queryFn: () => orderApi.shop({ limit: 200 }).then((r) => r.data.data),
  });

  const pieData = summary
    ? [
        { name: 'Low Stock', value: summary.lowStock },
        { name: 'Mid Stock', value: summary.midStock },
        { name: 'Expired', value: summary.expired },
        { name: 'Out of Stock', value: summary.outOfStock },
      ]
    : [];

  const delivered = orders?.filter((o) => o.status === 'delivered') || [];
  const totalRevenue = delivered.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = delivered.length ? totalRevenue / delivered.length : 0;

  const weeklyData = orders
    ? Object.values(
        orders.reduce((acc, o) => {
          const day = new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
          acc[day] = acc[day] || { day, revenue: 0 };
          acc[day].revenue += o.status === 'delivered' ? o.total : 0;
          return acc;
        }, {})
      )
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Sales & Inventory Analytics</h1>
        <p className="text-sm text-ink-500">A closer look at your pharmacy's performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon="💰" label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} accent="emerald" />
        <StatCard icon="🧾" label="Avg. Order Value" value={`₹${avgOrderValue.toFixed(2)}`} accent="brand" />
        <StatCard icon="✅" label="Orders Delivered" value={delivered.length} accent="brand" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <WeeklySalesChart data={weeklyData} />

        <div className="card">
          <h3 className="font-semibold text-ink-900">Inventory Health</h3>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemistAnalyticsPage;
