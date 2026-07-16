import { useEffect, useCallback, useState } from 'react';
import useEcoStore from '../store/ecoStore';
import toast from 'react-hot-toast';

export default function useBOM() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const { boms, bomsMeta, fetchBoms, createBom, updateBom } = useEcoStore();

  const loadBoms = useCallback(() => {
    fetchBoms(page, 25, search, filters).catch(() => toast.error('Failed to load BoMs'));
  }, [page, search, filters, fetchBoms]);

  useEffect(() => {
    loadBoms();
    // Auto-refresh every 30 seconds so BOM version changes from ECOs appear without manual reload
    const interval = setInterval(loadBoms, 30000);
    return () => clearInterval(interval);
  }, [loadBoms]);

  const handleCreate = async (data) => {
    try {
      const bom = await createBom(data);
      toast.success('BoM created');
      return bom;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create BoM');
      throw err;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const bom = await updateBom(id, data);
      toast.success('BoM updated');
      return bom;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update BoM');
      throw err;
    }
  };

  return { boms, bomsMeta, page, setPage, search, setSearch, filters, setFilters, handleCreate, handleUpdate, refresh: loadBoms };
}

