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

import SkeletonLoader from '../components/ui/SkeletonLoader';

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
      {!stats ? (
        <SkeletonLoader count={4} type="card" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open ECOs" value={stats?.openEcos ?? '—'} icon={GitPullRequest} trend="up" trendValue="+12% active" onClick={() => navigate('/eco')} />
          <StatCard title="Pending Approvals" value={stats?.pendingApprovals ?? '—'} icon={Clock} trend="down" trendValue="-3 pending" onClick={() => navigate('/eco')} />
          <StatCard title="Active Products" value={stats?.activeProducts ?? '—'} icon={Package} trend="up" trendValue="Ready for mfg" onClick={() => navigate('/products')} />
          <StatCard title="Active BoMs" value={stats?.activeBoms ?? '—'} icon={Layers} trend="up" trendValue="Verified" onClick={() => navigate('/bom')} />
        </div>
      )}

      {/* Pending Approvals Queue Banner for Approver / Admin */}
      {(user?.role === 'approver' || user?.role === 'admin') && recentEcos?.some(e => e.stage_name === 'Approval' || e.stage_name === 'In Review' || e.status === 'pending') && (
        <div className="bg-gradient-to-r from-amber-500/10 via-navy-800 to-sienna-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gainsboro-100 flex items-center gap-2">
                  Pending Approvals Queue
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-extrabold border border-amber-500/30">
                    {recentEcos.filter(e => e.stage_name === 'Approval' || e.stage_name === 'In Review' || e.status === 'pending').length} Action Required
                  </span>
                </h2>
                <p className="text-xs text-gainsboro-400">Change orders waiting for your review and approval</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/eco')}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30 transition-colors"
            >
              View All Approvals →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentEcos
              .filter(e => e.stage_name === 'Approval' || e.stage_name === 'In Review' || e.status === 'pending')
              .slice(0, 4)
              .map((eco) => (
                <div
                  key={eco.id}
                  onClick={() => loadEcoDetail(eco.id)}
                  className="bg-navy-900/80 border border-navy-600 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">{eco.stage_name || 'Approval'}</span>
                      <Badge status={eco.eco_type} />
                    </div>
                    <p className="text-sm font-semibold text-gainsboro-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {eco.title}
                    </p>
                    <p className="text-xs text-gainsboro-400 mt-1">Product: {eco.product_name || '—'} · By {eco.creator_name || 'User'}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-sienna-600 hover:bg-sienna-500 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap">
                    Review →
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

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
