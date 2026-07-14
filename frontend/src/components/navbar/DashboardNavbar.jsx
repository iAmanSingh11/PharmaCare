import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/*
 * Shared top bar for both the customer and chemist dashboards. `title`
 * differentiates the portal ("Customer Portal" vs "Pharmacist Portal")
 * without needing two near-duplicate components.
 */
const DashboardNavbar = ({ title, unreadCount = 0, onBellClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="font-semibold text-ink-900 dark:text-slate-100">💊 PharmaCare</p>
        <p className="text-xs text-ink-500">{title}</p>
      </div>

      <div className="flex items-center gap-5">
        <button onClick={toggleTheme} title="Toggle dark mode" className="text-lg">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button onClick={onBellClick} className="relative text-lg" aria-label="Notifications">
          🔔
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 font-medium text-brand-700"
          >
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-11 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold dark:text-slate-100">{user?.name}</p>
                <p className="truncate text-xs text-ink-500">{user?.email}</p>
              </div>
              <button className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">My Profile</button>
              <button className="block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800">Settings</button>
              <button onClick={logout} className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
