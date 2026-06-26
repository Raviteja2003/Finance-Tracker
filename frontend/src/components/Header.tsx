import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun, LogOut, User } from 'lucide-react';
import { logout, selectCurrentUser } from '../features/auth/authSlice';
import { useTheme } from '../context/ThemeContext';

export default function Header({ onMenuClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted hover:bg-surface-hover"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-md p-2 text-muted hover:bg-surface-hover"
          >
            <User size={18} />
            <span className="hidden text-sm sm:inline">
              {user?.name || user?.email || 'Account'}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md border border-border bg-surface py-1 shadow-lg">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-hover"
              >
                <LogOut size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}