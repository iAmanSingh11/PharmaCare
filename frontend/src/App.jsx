import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import ChemistLayout from './layouts/ChemistLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import Spinner from './components/common/Spinner';
import ChatWidget from './components/chat/ChatWidget';

// Route level code splitting each page ships as its own chunk instead of
// one large bundle, so first paint stays fast as the app grows.
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterChoicePage = lazy(() => import('./pages/public/RegisterChoicePage'));
const RegisterCustomerPage = lazy(() => import('./pages/public/RegisterCustomerPage'));
const RegisterChemistPage = lazy(() => import('./pages/public/RegisterChemistPage'));
const VerifyEmailPage = lazy(() => import('./pages/public/VerifyEmailPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));

const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const CustomerSearchPage = lazy(() => import('./pages/customer/CustomerSearchPage'));
const MedicineDetailPage = lazy(() => import('./pages/customer/MedicineDetailPage'));
const CustomerNearbyPage = lazy(() => import('./pages/customer/CustomerNearbyPage'));
const CustomerOrdersPage = lazy(() => import('./pages/customer/CustomerOrdersPage'));
const CustomerCartPage = lazy(() => import('./pages/customer/CustomerCartPage'));
const CustomerHistoryPage = lazy(() => import('./pages/customer/CustomerHistoryPage'));
const CustomerProfilePage = lazy(() => import('./pages/customer/CustomerProfilePage'));
const CustomerWishlistPage = lazy(() => import('./pages/customer/CustomerWishlistPage'));

const ChemistDashboard = lazy(() => import('./pages/chemist/ChemistDashboard'));
const ChemistInventoryPage = lazy(() => import('./pages/chemist/ChemistInventoryPage'));
const ChemistOrdersPage = lazy(() => import('./pages/chemist/ChemistOrdersPage'));
const ChemistAnalyticsPage = lazy(() => import('./pages/chemist/ChemistAnalyticsPage'));
const ChemistProfilePage = lazy(() => import('./pages/chemist/ChemistProfilePage'));
const ChemistCustomersPage = lazy(() => import('./pages/chemist/ChemistCustomersPage'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Suspense fallback={<Spinner fullScreen />}>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterChoicePage />} />
            <Route path="/register/customer" element={<RegisterCustomerPage />} />
            <Route path="/register/chemist" element={<RegisterChemistPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            {/* Customer portal */}
            <Route element={<RoleRoute allowedRoles={['customer']} />}>
              <Route path="/customer" element={<CustomerLayout />}>
                <Route index element={<CustomerDashboard />} />
                <Route path="search" element={<CustomerSearchPage />} />
                <Route path="medicine/:id" element={<MedicineDetailPage />} />
                <Route path="nearby" element={<CustomerNearbyPage />} />
                <Route path="wishlist" element={<CustomerWishlistPage />} />
                <Route path="orders" element={<CustomerOrdersPage />} />
                <Route path="cart" element={<CustomerCartPage />} />
                <Route path="history" element={<CustomerHistoryPage />} />
                <Route path="profile" element={<CustomerProfilePage />} />
              </Route>
            </Route>

            {/* Chemist portal */}
            <Route element={<RoleRoute allowedRoles={['chemist']} />}>
              <Route path="/chemist" element={<ChemistLayout />}>
                <Route index element={<ChemistDashboard />} />
                <Route path="inventory" element={<ChemistInventoryPage />} />
                <Route path="orders" element={<ChemistOrdersPage />} />
                <Route path="customers" element={<ChemistCustomersPage />} />
                <Route path="analytics" element={<ChemistAnalyticsPage />} />
                <Route path="profile" element={<ChemistProfilePage />} />
              </Route>
            </Route>

            {/* Admin console */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
      <ChatWidget />
    </>
  );
}

export default App;
