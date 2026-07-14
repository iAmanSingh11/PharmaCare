import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { token: searchParams.get('token') || '' },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.resetPassword(values);
      toast.success(data.message);
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-50/40 px-4 py-12">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink-900">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-500">Choose a new password for your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <input type="hidden" {...register('token', { required: true })} />
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">New Password</label>
            <input
              type="password"
              className="input-field"
              {...register('password', { required: true, minLength: { value: 8, message: 'Minimum 8 characters' } })}
            />
            {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Confirm New Password</label>
            <input
              type="password"
              className="input-field"
              {...register('confirmPassword', { validate: (v) => v === watch('password') || 'Passwords do not match' })}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Resetting…' : 'Reset Password →'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link to="/login" className="font-medium text-brand-500">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
