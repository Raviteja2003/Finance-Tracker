import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Placeholder pages — real implementations land in Phases 2-6.
// Keeping them here for now means the shell/routing is fully testable
// before any feature work starts.
function Placeholder({ title }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-1 text-sm text-muted">Coming in a later phase.</p>
    </div>
  );
}

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