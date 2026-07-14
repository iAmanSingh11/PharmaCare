import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';

const ForgotPasswordPage = () => {
  const { register, handleSubmit, formState: { isSubmitting, isSubmitSuccessful } } = useForm();

  const onSubmit = async (values) => {
    try {
      const { data } = await authApi.forgotPassword(values);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-50/40 px-4 py-12">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink-900">Forgot password?</h1>
        <p className="mt-1 text-sm text-ink-500">We'll email you a link to reset it</p>

        {isSubmitSuccessful ? (
          <p className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
            If that email is registered, a reset link is on its way. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Email Address</label>
              <input type="email" className="input-field" {...register('email', { required: true })} />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Sending…' : 'Send Reset Link →'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-500">
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-brand-500">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
