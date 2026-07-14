import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';
import { setAccessToken } from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: location.state?.email || '' },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.verifyEmail(values);
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      toast.success('Email verified! Welcome to PharmaCare.');
      navigate(data.data.user.role === 'chemist' ? '/chemist' : '/customer', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-50/40 px-4 py-12">
      <div className="card w-full max-w-md text-center">
        <span className="text-3xl">📧</span>
        <h1 className="mt-3 text-2xl font-bold text-ink-900">Verify your email</h1>
        <p className="mt-1 text-sm text-ink-500">Enter the 6-digit code we sent to your inbox</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4 text-left">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Email</label>
            <input className="input-field" {...register('email', { required: true })} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Verification Code</label>
            <input
              className="input-field text-center tracking-[0.5em]"
              maxLength={6}
              {...register('otp', { required: 'Code is required', minLength: 6, maxLength: 6 })}
            />
            {errors.otp && <p className="mt-1 text-xs text-rose-500">{errors.otp.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Verifying…' : 'Verify Email →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
