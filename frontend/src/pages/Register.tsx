import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation, useLoginMutation } from '../services/authApi';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading: isRegistering, error: registerError }] =
    useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const navigate = useNavigate();

  const isLoading = isRegistering || isLoggingIn;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password }).unwrap();
      // Backend's register endpoint returns the created user, not a token,
      // so chain straight into login to land the user signed in.
      await login({ email, password }).unwrap();
      navigate('/dashboard', { replace: true });
    } catch {
      // registerError below reflects the failure
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
        <h1 className="text-xl font-semibold text-text">Create your account</h1>
        <p className="mt-1 text-sm text-muted">Takes less than a minute.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {registerError && (
            <p className="text-sm text-danger">
              {registerError.data?.detail || 'Could not create account.'}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
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