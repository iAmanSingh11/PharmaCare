import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

/* Blocks access to nested routes unless a session is active. */
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner fullScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return <Outlet />;
};

export default ProtectedRoute;
