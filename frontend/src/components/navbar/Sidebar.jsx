import { NavLink } from 'react-router-dom';

/*
 * Shared sidebar shell. Each layout passes its own list of { to, label, icon }
 * links so customer and chemist portals can reuse the same visual chrome.
 */
const Sidebar = ({ links }) => (
  <aside className="hidden w-60 shrink-0 border-r border-slate-100 bg-white md:block dark:border-slate-800 dark:bg-slate-900">
    <nav className="flex flex-col gap-1 p-4">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-brand-50 text-brand-600' : 'text-ink-700 hover:bg-slate-50'
            }`
          }
        >
          <span>{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
