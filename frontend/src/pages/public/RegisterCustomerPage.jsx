import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';

const RegisterCustomerPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.registerCustomer(values);
      toast.success(data.message);
      navigate('/verify-email', { state: { email: values.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-50/40 px-4 py-12">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-500">Sign up as a customer to start ordering</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Full Name</label>
            <input className="input-field" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Email Address</label>
            <input type="email" className="input-field" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Phone Number</label>
            <input className="input-field" {...register('phone', { required: 'Phone is required' })} />
            {errors.phone && <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Password</label>
            <input
              type="password"
              className="input-field"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
            />
            {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              {...register('confirmPassword', {
                validate: (v) => v === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Creating account…' : 'Create Account →'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterCustomerPage;
