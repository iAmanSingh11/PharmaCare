import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userApi } from '../../api/user.api';

const CustomerProfilePage = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();

  const profileForm = useForm({ defaultValues: { name: user?.name, phone: user?.phone } });
  const addressForm = useForm({ defaultValues: { label: 'Home' } });

  const updateProfileMutation = useMutation({
    mutationFn: (values) => userApi.updateProfile(values),
    onSuccess: ({ data }) => {
      setUser(data.data);
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const addAddressMutation = useMutation({
    mutationFn: (values) => userApi.addAddress(values),
    onSuccess: ({ data }) => {
      setUser((prev) => ({ ...prev, addresses: data.data }));
      addressForm.reset({ label: 'Home' });
      toast.success('Address added');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not add address'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => userApi.deleteAddress(id),
    onSuccess: ({ data }) => {
      setUser((prev) => ({ ...prev, addresses: data.data }));
      toast.success('Address removed');
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">My Profile</h1>
        <p className="text-sm text-ink-500">Manage your personal details and delivery addresses</p>
      </div>

      <form onSubmit={profileForm.handleSubmit((v) => updateProfileMutation.mutate(v))} className="card grid gap-4 md:grid-cols-2">
        <h2 className="font-semibold text-ink-900 md:col-span-2">Personal Details</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Full Name</label>
          <input className="input-field" {...profileForm.register('name')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Phone</label>
          <input className="input-field" {...profileForm.register('phone')} />
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={updateProfileMutation.isPending} className="btn-primary">
            {updateProfileMutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      <div className="card">
        <h2 className="font-semibold text-ink-900">Delivery Addresses</h2>

        <div className="mt-4 space-y-3">
          {user?.addresses?.length ? (
            user.addresses.map((a) => (
              <div key={a._id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
                <div>
                  <p className="font-medium">{a.label}</p>
                  <p className="text-ink-500">{a.line1}, {a.city}, {a.state} {a.pincode}</p>
                </div>
                <button onClick={() => deleteAddressMutation.mutate(a._id)} className="text-rose-500">🗑️</button>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink-500">No saved addresses yet.</p>
          )}
        </div>

        <form
          onSubmit={addressForm.handleSubmit((v) => addAddressMutation.mutate(v))}
          className="mt-5 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-2"
        >
          <input className="input-field" placeholder="Label (e.g. Home)" {...addressForm.register('label')} />
          <input className="input-field" placeholder="Address line" {...addressForm.register('line1', { required: true })} />
          <input className="input-field" placeholder="City" {...addressForm.register('city', { required: true })} />
          <input className="input-field" placeholder="State" {...addressForm.register('state', { required: true })} />
          <input className="input-field" placeholder="Pincode" {...addressForm.register('pincode', { required: true })} />
          <button type="submit" disabled={addAddressMutation.isPending} className="btn-secondary">
            ＋ Add Address
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
