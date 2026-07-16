import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitPullRequest, Package, Layers, Clock, Plus } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';
import NewECOModal from '../components/eco/NewECOModal';
import ECODetailPanel from '../components/eco/ECODetailPanel';
import useEcoStore from '../store/ecoStore';
import useAuthStore from '../store/authStore';
import useECO from '../hooks/useECO';

export default function DashboardPage() {
  const { stats, recentEcos, fetchDashboardStats, fetchRecentEcos } = useEcoStore();
  const { user } = useAuthStore();
  const { handleCreate, loadEcoDetail, selectedEco, setSelectedEco, handleApprove, handleReject, handleNextStage, detailLoading } = useECO();
  const [showNewEco, setShowNewEco] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentEcos();
  }, []);

  const columns = [
    { key: 'title', label: 'Title', render: (v) => <span className="font-medium text-gainsboro-200">{v}</span> },
    { key: 'eco_type', label: 'Type', render: (v) => <Badge status={v} /> },
    { key: 'product_name', label: 'Product' },
    { key: 'stage_name', label: 'Stage', render: (v) => <Badge status={v} /> },
    { key: 'creator_name', label: 'Created By' },
    { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString() },
  ];

  const canCreate = user?.role === 'engineering' || user?.role === 'admin';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gainsboro-100">Dashboard</h1>
          <p className="text-sm text-gainsboro-400 mt-1">Welcome back, {user?.name}</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowNewEco(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={16} /> New ECO
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Open ECOs" value={stats?.openEcos ?? '—'} icon={GitPullRequest} onClick={() => navigate('/eco')} />
        <StatCard title="Pending Approvals" value={stats?.pendingApprovals ?? '—'} icon={Clock} onClick={() => navigate('/eco')} />
        <StatCard title="Active Products" value={stats?.activeProducts ?? '—'} icon={Package} onClick={() => navigate('/products')} />
        <StatCard title="Active BoMs" value={stats?.activeBoms ?? '—'} icon={Layers} onClick={() => navigate('/bom')} />
      </div>

      {/* Recent ECOs */}
      <div>
        <h2 className="text-lg font-semibold text-gainsboro-200 mb-3">Recent Change Orders</h2>
        <Table columns={columns} data={recentEcos} emptyMessage="No recent ECOs" onRowClick={(row) => loadEcoDetail(row.id)} />
      </div>

      <NewECOModal isOpen={showNewEco} onClose={() => setShowNewEco(false)} onSubmit={handleCreate} />

      {selectedEco && (
        <ECODetailPanel
          eco={selectedEco}
          onClose={() => setSelectedEco(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onNextStage={handleNextStage}
          loading={detailLoading}
        />
      )}
    </div>
  );
}
