import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Landmark } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import {
  registerUser,
  loginUser,
  selectAuthStatus,
  selectAuthError,
} from '../store/slices/authSlice';

/**
 * Registration page component.
 *
 * Renders a sign-up form that creates a user account and automatically logs
 * them in upon successful registration, then redirects to the dashboard.
 */
export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const error = useAppSelector(selectAuthError);
  const isLoading = status === 'loading';
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const registerResult = await dispatch(registerUser({ name, email, password }));
    if (!registerUser.fulfilled.match(registerResult)) return; // error already in state

    // Backend's /auth/register returns the created user, not a token,
    // so chain straight into loginUser to land the user signed in.
    const loginResult = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(loginResult)) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Landmark size={18} color="white" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-text">Finance Tracker</span>
          </Link>

          <h1 className="font-display mt-5 text-2xl font-semibold tracking-tight text-text">Create your account</h1>
          <p className="mt-1 text-sm text-muted">Takes less than a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text/80">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text/80">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}