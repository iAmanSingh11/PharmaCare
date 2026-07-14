import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardNavbar from '../components/navbar/DashboardNavbar';
import Sidebar from '../components/navbar/Sidebar';
import { notificationApi } from '../api/notification.api';

const LINKS = [
  { to: '/chemist', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/chemist/inventory', label: 'Inventory', icon: '💊' },
  { to: '/chemist/orders', label: 'Orders', icon: '📦' },
  { to: '/chemist/customers', label: 'Customers', icon: '👥' },
  { to: '/chemist/analytics', label: 'Analytics', icon: '📊' },
  { to: '/chemist/profile', label: 'Shop Profile', icon: '🏬' },
];

const ChemistLayout = () => {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list().then((r) => r.data),
    refetchInterval: 30000,
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar links={LINKS} />
      <div className="flex-1">
        <DashboardNavbar title="Pharmacist Portal" unreadCount={data?.unreadCount} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ChemistLayout;
