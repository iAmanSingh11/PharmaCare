import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const NAV_LINKS = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Features', id: 'features' },
  { label: 'How it Works', id: 'how-it-works' },
  { label: 'Testimonials', id: 'testimonials' },
  { label: 'Contact', id: 'contact' },
];

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMenuOpen(false);
    if (id === 'home') {
      if (location.pathname !== '/') navigate('/');
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">💊</span>
          <div>
            <p className="text-lg font-bold leading-none text-ink-900 dark:text-slate-100">PharmaCare</p>
            <p className="text-xs text-ink-500">Trusted Healthcare Platform</p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-sm font-medium text-ink-700 transition hover:text-brand-500 dark:text-slate-300"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button onClick={toggleTheme} title="Toggle dark mode" className="text-lg">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link to="/login" className="text-sm font-medium text-ink-700 hover:text-brand-500 dark:text-slate-300">
            Login
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
          ☰
        </button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-4 md:hidden dark:border-slate-800">
          {NAV_LINKS.map((link) => (
            <button key={link.id} onClick={() => scrollToSection(link.id)} className="text-left text-sm font-medium dark:text-slate-300">
              {link.label}
            </button>
          ))}
          <Link to="/login" className="text-sm font-medium dark:text-slate-300">Login</Link>
          <Link to="/register" className="btn-primary w-fit text-sm">Get Started</Link>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
