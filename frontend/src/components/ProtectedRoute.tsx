import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

export default function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve where they were headed so Login can redirect back after success.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}