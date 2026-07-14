import { Link } from 'react-router-dom';

const RegisterChoicePage = () => (
  <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-50/40 px-4 py-12">
    <div className="w-full max-w-2xl text-center">
      <h1 className="text-2xl font-bold text-ink-900">Join PharmaCare as…</h1>
      <p className="mt-1 text-sm text-ink-500">Choose the account type that fits you</p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Link to="/register/customer" className="card text-left transition hover:shadow-lg">
          <span className="text-3xl">👤</span>
          <h2 className="mt-3 font-semibold text-ink-900">I'm a Customer</h2>
          <p className="mt-2 text-sm text-ink-500">
            Order medicines from nearby pharmacies, track deliveries, and manage your health records.
          </p>
        </Link>

        <Link to="/register/chemist" className="card text-left transition hover:shadow-lg">
          <span className="text-3xl">🏬</span>
          <h2 className="mt-3 font-semibold text-ink-900">I'm a Pharmacist</h2>
          <p className="mt-2 text-sm text-ink-500">
            List your pharmacy, manage inventory, and fulfill orders with real time notifications.
          </p>
        </Link>
      </div>

      <p className="mt-8 text-sm text-ink-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-500">
          Log in
        </Link>
      </p>
    </div>
  </div>
);

export default RegisterChoicePage;
