import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/navbar/PublicNavbar';
import Footer from '../components/navbar/Footer';

const PublicLayout = () => (
  <div className="flex min-h-screen flex-col">
    <PublicNavbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default PublicLayout;
