import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { medicineApi } from '../../api/medicine.api';

const CATEGORIES = [
  'Pain Relief', 'Fever', 'Cold & Flu', 'Vitamins & Supplements',
  'Antibiotics', 'Digestive Care', 'Skin Care', 'Diabetes Care', 'Cardiac Care', 'Other',
];

const MedicineFormModal = ({ medicine, onClose }) => {
  const isEdit = Boolean(medicine);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: isEdit
      ? {
          name: medicine.name,
          category: medicine.category,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiryDate?.slice(0, 10),
          mrp: medicine.mrp,
          sellingPrice: medicine.sellingPrice,
          discountPercent: medicine.discountPercent,
          stockQuantity: medicine.stockQuantity,
          lowStockThreshold: medicine.lowStockThreshold,
        }
      : { lowStockThreshold: 10 },
  });

  const mutation = useMutation({
    mutationFn: (formData) => (isEdit ? medicineApi.update(medicine._id, formData) : medicineApi.create(formData)),
    onSuccess: () => {
      toast.success(isEdit ? 'Medicine updated' : 'Medicine added to inventory');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
  });

  const onSubmit = (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'images') return;
      formData.append(key, value);
    });
    if (values.images?.length) {
      Array.from(values.images).forEach((file) => formData.append('images', file));
    }
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">{isEdit ? 'Edit Medicine' : 'Add Medicine'}</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">Medicine Name</label>
            <input className="input-field" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Category</label>
            <select className="input-field" {...register('category', { required: true })}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Batch Number</label>
            <input className="input-field" {...register('batchNumber', { required: true })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Expiry Date</label>
            <input type="date" className="input-field" {...register('expiryDate', { required: true })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Stock Quantity</label>
            <input type="number" className="input-field" {...register('stockQuantity', { required: true, min: 0 })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">MRP (₹)</label>
            <input type="number" step="0.01" className="input-field" {...register('mrp', { required: true, min: 0 })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Selling Price (₹)</label>
            <input type="number" step="0.01" className="input-field" {...register('sellingPrice', { required: true, min: 0 })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Discount (%)</label>
            <input type="number" min="0" max="100" className="input-field" {...register('discountPercent', { min: 0, max: 100 })} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Low Stock Threshold</label>
            <input type="number" className="input-field" {...register('lowStockThreshold', { min: 0 })} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-ink-700">Photos</label>
            <input type="file" accept="image/*" multiple className="input-field" {...register('images')} />
          </div>

          <div className="flex gap-3 md:col-span-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineFormModal;
