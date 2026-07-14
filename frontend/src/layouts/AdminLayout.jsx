import { Outlet } from 'react-router-dom';
import DashboardNavbar from '../components/navbar/DashboardNavbar';
import Sidebar from '../components/navbar/Sidebar';

const LINKS = [
  { to: '/admin', label: 'Overview', icon: '🏠', end: true },
  { to: '/admin/users', label: 'Users & Chemists', icon: '👥' },
];

const AdminLayout = () => (
  <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
    <Sidebar links={LINKS} />
    <div className="flex-1">
      <DashboardNavbar title="Admin Console" />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default AdminLayout;
