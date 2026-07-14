import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* Further restricts a protected route to specific roles (customer/chemist). */
const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
