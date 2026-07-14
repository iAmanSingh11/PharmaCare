import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { medicineApi } from '../../api/medicine.api';
import InventoryTable from '../../components/inventory/InventoryTable';
import MedicineFormModal from '../../components/inventory/MedicineFormModal';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { SkeletonRow } from '../../components/common/Skeleton';

const ChemistInventoryPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalState, setModalState] = useState(null); // null | 'new' | medicine object
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['inventory', { search, page }],
    queryFn: () => medicineApi.myInventory({ search, page, limit: 10 }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => medicineApi.remove(id),
    onSuccess: () => {
      toast.success('Medicine removed');
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Could not delete medicine'),
  });

  const handleDelete = (medicine) => {
    if (window.confirm(`Remove "${medicine.name}" from your inventory?`)) {
      deleteMutation.mutate(medicine._id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Inventory Management</h1>
          <p className="text-sm text-ink-500">Total medicines: {data?.pagination?.total ?? '—'}</p>
        </div>
        <button onClick={() => setModalState('new')} className="btn-primary">＋ Add Medicine</button>
      </div>

      <input
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search medicines by name, brand, or category…"
        className="input-field max-w-md"
      />

      {isLoading ? (
        <div className="rounded-2xl bg-white shadow-soft">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : data?.data?.length ? (
        <>
          <InventoryTable medicines={data.data} onEdit={setModalState} onDelete={handleDelete} />
          <Pagination
            page={data.pagination.page}
            limit={data.pagination.limit}
            total={data.pagination.total}
            onPageChange={setPage}
          />
        </>
      ) : (
        <EmptyState
          icon="💊"
          title="No medicines yet"
          description="Add your first medicine to make it searchable to nearby customers."
          action={<button onClick={() => setModalState('new')} className="btn-primary">Add Medicine</button>}
        />
      )}

      {modalState && (
        <MedicineFormModal
          medicine={modalState === 'new' ? null : modalState}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
};

export default ChemistInventoryPage;
