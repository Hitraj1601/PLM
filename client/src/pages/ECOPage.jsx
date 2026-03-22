import { useState } from 'react';
import { Plus, LayoutGrid, List, Search, Filter } from 'lucide-react';
import useECO from '../hooks/useECO';
import useEcoStore from '../store/ecoStore';
import useAuthStore from '../store/authStore';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import ECOCard from '../components/eco/ECOCard';
import ECODetailPanel from '../components/eco/ECODetailPanel';
import NewECOModal from '../components/eco/NewECOModal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';

export default function ECOPage() {
  const { ecos, ecosMeta, page, setPage, search, setSearch, filters, setFilters, loading, selectedEco, detailLoading, loadEcoDetail, loadFullEcoDetail, setSelectedEco, handleCreate, handleNextStage, handleApprove, handleReject, refresh } = useECO();
  const { stages, fetchStages, patchEcoStage } = useEcoStore();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState('table');
  const [showNewEco, setShowNewEco] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const canCreate = user?.role === 'engineering' || user?.role === 'admin';

  useState(() => { fetchStages(); }, []);

  const handleAction = async (fn, id, lastKnownUpdatedAt) => {
    setActionLoading(true);
    try {
      await fn(id, lastKnownUpdatedAt);
      await refresh();
      if (selectedEco) await loadEcoDetail(id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleKanbanDrop = async (ecoId, newStageId) => {
    const numericId = parseInt(ecoId);
    const ecoMove = ecos.find(e => e.id === numericId);
    if (!ecoMove || ecoMove.stage_id === newStageId) return;

    try {
      await patchEcoStage(numericId, newStageId, ecoMove.updated_at);
      import('react-hot-toast').then(({ default: toast }) => toast.success('Stage updated'));
    } catch (err) {
      import('react-hot-toast').then(({ default: toast }) => {
        if (err.response?.status === 409) toast.error('This ECO was modified by another user. Please refresh to see the latest data.');
        else toast.error(err.response?.data?.error || 'Failed to move card');
      });
    }
  };

  const columns = [
    { key: 'title', label: 'Title', render: (v) => <span className="font-medium text-gainsboro-200 line-clamp-1">{v}</span> },
    { key: 'eco_type', label: 'Type', render: (v) => <Badge status={v} /> },
    { key: 'product_name', label: 'Product' },
    { key: 'creator_name', label: 'Assignee' },
    { key: 'stage_name', label: 'Stage', render: (v) => <Badge status={v} /> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    { key: 'effective_date', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  ];

  // Kanban columns
  const stagesSorted = [...(stages || [])].sort((a, b) => a.order_index - b.order_index);
  const kanbanColumns = stagesSorted.map((stage) => ({
    ...stage,
    ecos: ecos.filter((e) => e.stage_name === stage.name || (e.stage_id === stage.id)),
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gainsboro-100">Change Orders</h1>
          <p className="text-sm text-gainsboro-400 mt-1">{ecosMeta?.total || ecos.length} ECOs total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Column Filters */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gainsboro-500" />
            <select
              value={filters.eco_type}
              onChange={(e) => { setFilters({ ...filters, eco_type: e.target.value }); setPage(1); }}
              className="bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="product">Product</option>
              <option value="bom">BoM</option>
            </select>
            <select
              value={filters.stage}
              onChange={(e) => { setFilters({ ...filters, stage: e.target.value }); setPage(1); }}
              className="bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent px-3 py-2"
            >
              <option value="">All Stages</option>
              <option value="New">New</option>
              <option value="In Review">In Review</option>
              <option value="Approval">Approval</option>
              <option value="Done">Done</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className="bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="applied">Applied</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          {/* Search input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
            <input
              type="text"
              placeholder="Search ECOs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 placeholder-gainsboro-500 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent w-56"
            />
          </div>
          {/* View toggle */}
          <div className="flex bg-navy-800 border border-navy-600 rounded-lg p-0.5">
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-sienna-600 text-white' : 'text-gainsboro-400 hover:text-gainsboro-200'}`}>
              <List size={16} />
            </button>
            <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-sienna-600 text-white' : 'text-gainsboro-400 hover:text-gainsboro-200'}`}>
              <LayoutGrid size={16} />
            </button>
          </div>
          {canCreate && (
            <button onClick={() => setShowNewEco(true)} className="flex items-center gap-2 px-4 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors">
              <Plus size={16} /> New ECO
            </button>
          )}
        </div>
      </div>

      {ecos.length === 0 ? (
        <EmptyState title="No ECOs yet" message="Create your first Engineering Change Order" action={canCreate ? () => setShowNewEco(true) : undefined} actionLabel="New ECO" />
      ) : viewMode === 'table' ? (
        <>
          <Table columns={columns} data={ecos} onRowClick={(row) => loadEcoDetail(row.id)} />
          <Pagination meta={ecosMeta} onPageChange={setPage} />
        </>
      ) : (
        /* Kanban Board */
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stagesSorted.length}, minmax(250px, 1fr))` }}>
          {kanbanColumns.map((col) => (
            <div 
              key={col.id} 
              className="bg-navy-900/50 rounded-xl p-3 border border-navy-600/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const ecoId = e.dataTransfer.getData('ecoId');
                if (ecoId) handleKanbanDrop(ecoId, col.id);
              }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Badge status={col.name} />
                  <span className="text-xs text-gainsboro-500">{col.ecos.length}</span>
                </div>
              </div>
              <div className="space-y-3">
                {col.ecos.map((eco) => (
                  <div 
                    key={eco.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('ecoId', eco.id);
                    }}
                    className="cursor-move"
                  >
                    <ECOCard eco={eco} onClick={() => loadEcoDetail(eco.id)} />
                  </div>
                ))}
                {col.ecos.length === 0 && <p className="text-xs text-gainsboro-600 text-center py-4">No ECOs</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ECO Detail Panel */}
      {selectedEco && (
        <ECODetailPanel
          eco={selectedEco}
          onClose={() => setSelectedEco(null)}
          onApprove={(id, updatedAt) => handleAction(handleApprove, id, updatedAt)}
          onReject={(id, updatedAt) => handleAction(handleReject, id, updatedAt)}
          onNextStage={(id, updatedAt) => handleAction(handleNextStage, id, updatedAt)}
          loadFullEcoDetail={() => loadFullEcoDetail(selectedEco.id)}
          loading={actionLoading || detailLoading}
        />
      )}

      <NewECOModal isOpen={showNewEco} onClose={() => setShowNewEco(false)} onSubmit={handleCreate} />
    </div>
  );
}
