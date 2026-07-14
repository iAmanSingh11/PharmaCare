import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';

const ChemistProfilePage = () => {
  const { user, setUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name,
      phone: user?.phone,
      shopName: user?.shopDetails?.shopName,
      licenseNumber: user?.shopDetails?.licenseNumber,
      gstNumber: user?.shopDetails?.gstNumber,
      openTime: user?.shopDetails?.openingHours?.open,
      closeTime: user?.shopDetails?.openingHours?.close,
    },
  });

  const onSubmit = async (values) => {
    try {
      const { data } = await api.patch('/users/profile', {
        name: values.name,
        phone: values.phone,
        shopDetails: {
          shopName: values.shopName,
          licenseNumber: values.licenseNumber,
          gstNumber: values.gstNumber,
          openingHours: { open: values.openTime, close: values.closeTime },
        },
      });
      setUser(data.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Shop Profile</h1>
        <p className="text-sm text-ink-500">Keep your pharmacy details accurate and up to date</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Owner Name</label>
          <input className="input-field" {...register('name')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Phone</label>
          <input className="input-field" {...register('phone')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Shop Name</label>
          <input className="input-field" {...register('shopName')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">License Number</label>
          <input className="input-field" {...register('licenseNumber')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">GST Number</label>
          <input className="input-field" {...register('gstNumber')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Opens</label>
            <input type="time" className="input-field" {...register('openTime')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Closes</label>
            <input type="time" className="input-field" {...register('closeTime')} />
          </div>
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChemistProfilePage;
