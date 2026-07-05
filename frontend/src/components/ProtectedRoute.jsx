import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

/**
 * Wraps protected routes and redirects unauthenticated users to login.
 *
 * If the user is not authenticated, the current location is stored in
 * navigation state so the app can redirect back after successful login.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}