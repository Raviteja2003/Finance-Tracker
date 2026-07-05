import { useNavigate, Link } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, User, Landmark } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout, selectCurrentUser } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import StampBadge from '../components/StampBadge';

export default function Header({ onMenuClick }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="ledger-rule-top sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-muted hover:bg-surface-hover lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2 hover:opacity-80">
          <StampBadge icon={Landmark} color="blue" size={28} />
          <span className="font-display text-lg font-semibold tracking-tight text-text">Finance Tracker</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted hover:bg-surface-hover"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 rounded-md p-2 text-muted">
          <User size={18} />
          <span className="hidden text-sm sm:inline">
            {user?.name || user?.email || 'Account'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md p-2 text-text hover:bg-surface-hover text-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}