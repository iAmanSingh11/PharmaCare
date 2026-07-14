import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center px-6 text-center">
    <span className="text-6xl">🔍</span>
    <h1 className="mt-4 text-3xl font-bold text-ink-900">Page not found</h1>
    <p className="mt-2 text-ink-500">The page you're looking for doesn't exist or has moved.</p>
    <Link to="/" className="btn-primary mt-6">Back to Home</Link>
  </div>
);

export default NotFoundPage;
