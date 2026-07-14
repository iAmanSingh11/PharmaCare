import { Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DashboardNavbar from '../components/navbar/DashboardNavbar';
import Sidebar from '../components/navbar/Sidebar';
import { notificationApi } from '../api/notification.api';

const LINKS = [
  { to: '/customer', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/customer/search', label: 'Find Medicines', icon: '🔎' },
  { to: '/customer/nearby', label: 'Nearby Pharmacies', icon: '📍' },
  { to: '/customer/wishlist', label: 'Wishlist', icon: '❤️' },
  { to: '/customer/orders', label: 'My Orders', icon: '📦' },
  { to: '/customer/cart', label: 'Cart', icon: '🛒' },
  { to: '/customer/history', label: 'Health Records', icon: '🩺' },
  { to: '/customer/profile', label: 'Profile', icon: '👤' },
];

const CustomerLayout = () => {
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list().then((r) => r.data),
    refetchInterval: 30000,
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar links={LINKS} />
      <div className="flex-1">
        <DashboardNavbar title="Customer Portal" unreadCount={data?.unreadCount} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
