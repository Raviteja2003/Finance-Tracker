import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

/**
 * Placeholder pages — real implementations land in Phases 2-6.
 * Keeping them here for now means the shell/routing is fully testable
 * before any feature work starts.
 */
/**
 * Simple placeholder component used for routes that are not yet implemented.
 *
 * @param props.title - Title displayed in the placeholder card.
 * @returns A styled placeholder element indicating the feature is coming later.
 */
function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-1 text-sm text-muted">Coming in a later phase.</p>
    </div>
  );
}

/**
 * Application route definitions.
 *
 * Public routes:
 * - `/` : Landing page
 * - `/login` : Login page
 * - `/register` : Registration page
 *
 * Protected routes (require authentication) are wrapped with `ProtectedRoute`
 * and rendered inside `AppLayout`.
 *
 * Several feature routes currently render `Placeholder` components until
 * their full implementations are added in later phases.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Placeholder title="Dashboard" />} />
          <Route path="/transactions" element={<Placeholder title="Transactions" />} />
          <Route path="/accounts" element={<Placeholder title="Accounts" />} />
          <Route path="/budgets" element={<Placeholder title="Budgets" />} />
          <Route path="/analytics" element={<Placeholder title="Analytics" />} />
          <Route path="/chatbot" element={<Placeholder title="Chatbot" />} />
        </Route>
      </Route>

      <Route path="*" element={<Placeholder title="Page not found" />} />
    </Routes>
  );
}