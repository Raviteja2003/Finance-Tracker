import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { logout, selectCurrentUser } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

export default function Header({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      {/* Left side: Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-2 text-muted hover:bg-surface-hover lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <span className="text-lg font-semibold text-text">Finance Tracker</span>
      </div>

      {/* Right side: All items in parallel */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted hover:bg-surface-hover"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Info (Now just a flat layout block, not a clickable menu trigger) */}
        <div className="flex items-center gap-2 rounded-md p-2 text-muted">
          <User size={18} />
          <span className="hidden text-sm sm:inline">
            {user?.name || user?.email || 'Account'}
          </span>
        </div>

        {/* Log Out Button (Parallel to everything else) */}
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