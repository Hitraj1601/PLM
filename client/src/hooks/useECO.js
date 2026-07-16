import { useEffect, useState, useCallback } from 'react';
import useEcoStore from '../store/ecoStore';
import toast from 'react-hot-toast';

export default function useECO() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ eco_type: '', status: '', stage: '' });
  const {
    ecos, ecosMeta, loading,
    fetchEcos, createEco, updateEco, nextStage, approveEco, rejectEco, fetchEcoById, fetchEcoSummary,
    fetchProducts, fetchBoms,
  } = useEcoStore();
  const [selectedEco, setSelectedEco] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadEcos = useCallback(() => {
    fetchEcos(page, 25, search, filters).catch(() => toast.error('Failed to load ECOs'));
  }, [page, search, filters, fetchEcos]);

  useEffect(() => {
    loadEcos();
    // Auto-refresh every 30 seconds so ECO status changes appear without manual reload
    const interval = setInterval(loadEcos, 30000);
    return () => clearInterval(interval);
  }, [loadEcos]);


  const loadEcoDetail = async (id) => {
    setDetailLoading(true);
    try {
      const summary = await fetchEcoSummary(id);
      setSelectedEco(summary);
    } catch (err) {
      toast.error('Failed to load ECO summary');
    } finally {
      setDetailLoading(false);
    }
  };

  const loadFullEcoDetail = async (id) => {
    try {
      const fullData = await fetchEcoById(id);
      setSelectedEco(fullData);
    } catch (err) {
      toast.error('Failed to load full ECO details');
    }
  };

  const handleCreate = async (data) => {
    try {
      const eco = await createEco(data);
      toast.success('ECO created successfully');
      return eco;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create ECO');
      throw err;
    }
  };

  const handleNextStage = async (id, lastKnownUpdatedAt) => {
    try {
      const eco = await nextStage(id, lastKnownUpdatedAt);
      toast.success('Moved to next stage');
      if (selectedEco?.id === id) await loadEcoDetail(id);
      // Refresh products and boms in case this move triggered an ECO application (new version)
      await loadEcos();
      try { await Promise.all([fetchProducts(), fetchBoms()]); } catch (_) { /* non-fatal */ }
      return eco;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to move stage');
      throw err;
    }
  };

  const handleApprove = async (id, lastKnownUpdatedAt) => {
    try {
      const eco = await approveEco(id, lastKnownUpdatedAt);
      toast.success('ECO approved');
      if (selectedEco?.id === id) await loadEcoDetail(id);
      // Refresh products and boms in case approval triggered an ECO application (new version)
      await loadEcos();
      try { await Promise.all([fetchProducts(), fetchBoms()]); } catch (_) { /* non-fatal */ }
      return eco;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed');
      throw err;
    }
  };

  const handleReject = async (id, lastKnownUpdatedAt) => {
    try {
      const eco = await rejectEco(id, lastKnownUpdatedAt);
      toast.success('ECO rejected');
      if (selectedEco?.id === id) await loadEcoDetail(id);
      return eco;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rejection failed');
      throw err;
    }
  };

  return {
    ecos, ecosMeta, page, setPage, search, setSearch, filters, setFilters, loading, selectedEco, detailLoading,
    loadEcoDetail, loadFullEcoDetail, setSelectedEco,
    handleCreate, handleNextStage, handleApprove, handleReject,
    refresh: loadEcos,
  };
}
