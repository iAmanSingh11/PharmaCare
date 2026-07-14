import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../api/auth.api';

const RegisterChemistPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        shopAddress: {
          line1: values.addressLine1,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
        },
      };
      const { data } = await authApi.registerChemist(payload);
      toast.success(data.message);
      navigate('/verify-email', { state: { email: values.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-brand-50/40 px-4 py-12">
      <div className="card w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-ink-900">List your pharmacy</h1>
        <p className="mt-1 text-sm text-ink-500">Register as a chemist to start managing inventory & orders</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Owner Name</label>
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Password</label>
            <input
              type="password"
              className="input-field"
              {...register('password', { required: 'Password is required', minLength: 8 })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Shop Name</label>
            <input className="input-field" {...register('shopName', { required: 'Shop name is required' })} />
            {errors.shopName && <p className="mt-1 text-xs text-rose-500">{errors.shopName.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Drug License Number</label>
            <input className="input-field" {...register('licenseNumber', { required: 'License number is required' })} />
            {errors.licenseNumber && <p className="mt-1 text-xs text-rose-500">{errors.licenseNumber.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">GST Number</label>
            <input className="input-field" {...register('gstNumber', { required: 'GST number is required' })} />
            {errors.gstNumber && <p className="mt-1 text-xs text-rose-500">{errors.gstNumber.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Pincode</label>
            <input className="input-field" {...register('pincode', { required: 'Pincode is required' })} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">Shop Address</label>
            <input className="input-field" {...register('addressLine1', { required: 'Address is required' })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">City</label>
            <input className="input-field" {...register('city', { required: 'City is required' })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">State</label>
            <input className="input-field" {...register('state', { required: 'State is required' })} />
          </div>

          <div className="md:col-span-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Creating account…' : 'Register Pharmacy →'}
            </button>
          </div>
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

export default RegisterChemistPage;
