import { useState } from 'react';
import { X, Calendar, User, Package, Layers, CheckCircle, Clock, GitBranch, ChevronDown, ChevronRight } from 'lucide-react';
import Badge from '../ui/Badge';
import DiffViewer from './DiffViewer';
import StageProgressBar from './StageProgressBar';
import AuditTimeline from './AuditTimeline';
import DependencyWarningCard from './DependencyWarningCard';
import useAuthStore from '../../store/authStore';

export default function ECODetailPanel({ eco, onClose, onApprove, onReject, onNextStage, loadFullEcoDetail, loading }) {
  const [expanded, setExpanded] = useState({ changes: false, audit: false });
  const [loadingFull, setLoadingFull] = useState(false);
  const [conflictError, setConflictError] = useState(false);

  const handleExpand = async (section) => {
    const isExpanding = !expanded[section];
    setExpanded(prev => ({ ...prev, [section]: isExpanding }));

    if (isExpanding && !eco.changes) {
      setLoadingFull(true);
      await loadFullEcoDetail();
      setLoadingFull(false);
    }
  };
  const { user } = useAuthStore();
  if (!eco) return null;

  const isApprover = user?.role === 'approver' || user?.role === 'admin';
  const isEngineering = user?.role === 'engineering' || user?.role === 'admin';
  const isApprovalStage = eco.requires_approval;
  const isDone = eco.status === 'applied';
  const isRejected = eco.status === 'rejected';
  const isActionable = !isDone && !isRejected;

  const wrapAction = async (actionFn) => {
    setConflictError(false);
    try {
      await actionFn();
    } catch (err) {
      if (err.response?.status === 409) {
        setConflictError(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-3xl bg-navy-900 border-l border-navy-600 shadow-2xl animate-slide-in overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-navy-900 border-b border-navy-600 px-6 py-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge status={eco.eco_type} />
                <Badge status={eco.status} />
                {isDone && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <CheckCircle size={12} />
                    Applied ✓
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gainsboro-100">{eco.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-gainsboro-400 hover:text-gainsboro-200 hover:bg-navy-700">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {conflictError && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium">The ECO was modified by another user. Please close and reopen to see the latest changes.</span>
            </div>
          )}

          {/* Section 1: Details */}
          <section>
            <h3 className="text-sm font-semibold text-gainsboro-400 uppercase tracking-wider mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem icon={Package} label="Product" value={`${eco.product_name || '—'} ${eco.product_version || ''}`} />
              <DetailItem icon={User} label="Created By" value={eco.creator_name || '—'} />
              <DetailItem icon={Calendar} label="Effective Date" value={eco.effective_date ? new Date(eco.effective_date).toLocaleDateString() : '—'} />
              <DetailItem icon={GitBranch} label="Version Update" value={eco.version_update ? 'New version' : 'Patch existing'} />
              <DetailItem icon={Clock} label="Created" value={new Date(eco.created_at).toLocaleString()} />
              {eco.bom_id && <DetailItem icon={Layers} label="BoM" value={`BoM linked`} />}
            </div>
          </section>

          {/* Section 2: Changes (Diff View) */}
          <section className="bg-navy-800/20 rounded-xl overflow-hidden border border-navy-700">
            <button 
              onClick={() => handleExpand('changes')}
              className="w-full flex items-center justify-between p-4 hover:bg-navy-800/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gainsboro-200 uppercase tracking-wider">Proposed Changes</h3>
              {expanded.changes ? <ChevronDown size={18} className="text-gainsboro-400" /> : <ChevronRight size={18} className="text-gainsboro-400" />}
            </button>
            {expanded.changes && (
              <div className="p-4 border-t border-navy-700">
                {loadingFull && !eco.changes ? (
                  <div className="text-sm text-gainsboro-400 py-4 text-center">Loading full details...</div>
                ) : (
                  <DiffViewer eco={eco} />
                )}
              </div>
            )}
          </section>

          {/* Section 3: Impact Analysis */}
          <section>
            <h3 className="text-sm font-semibold text-gainsboro-400 uppercase tracking-wider mb-3">Impact Analysis</h3>
            <DependencyWarningCard ecoId={eco.id} />
          </section>

          {/* Section 4: Stage Progress */}
          <section>
            <h3 className="text-sm font-semibold text-gainsboro-400 uppercase tracking-wider mb-3">Stage Progress</h3>
            <StageProgressBar stages={eco.stages} currentStageId={eco.stage_id} ecoStatus={eco.status} />
          </section>

          {/* Section 4: Actions */}
          {isActionable && (
            <section>
              <h3 className="text-sm font-semibold text-gainsboro-400 uppercase tracking-wider mb-3">Actions</h3>
              <div className="flex gap-3">
                {isApprover && isApprovalStage && (
                  <>
                    <button
                      onClick={() => wrapAction(() => onApprove?.(eco.id, eco.updated_at))}
                      disabled={loading}
                      className="px-6 py-2.5 bg-xanadu-600 hover:bg-xanadu-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => wrapAction(() => onReject?.(eco.id, eco.updated_at))}
                      disabled={loading}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                {isEngineering && !isApprovalStage && (
                  <button
                    onClick={() => wrapAction(() => onNextStage?.(eco.id, eco.updated_at))}
                    disabled={loading}
                    className="px-6 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Move to Next Stage'}
                  </button>
                )}
              </div>
            </section>
          )}

          {isRejected && (
            <section>
              <div className="glass-card p-4 border-red-500/30">
                <p className="text-sm text-red-400 font-semibold">This ECO has been rejected.</p>
              </div>
            </section>
          )}

          {/* Section 5: Audit Timeline */}
          <section className="bg-navy-800/20 rounded-xl overflow-hidden border border-navy-700">
            <button 
              onClick={() => handleExpand('audit')}
              className="w-full flex items-center justify-between p-4 hover:bg-navy-800/40 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gainsboro-200 uppercase tracking-wider">Audit History</h3>
              {expanded.audit ? <ChevronDown size={18} className="text-gainsboro-400" /> : <ChevronRight size={18} className="text-gainsboro-400" />}
            </button>
            {expanded.audit && (
              <div className="p-4 border-t border-navy-700">
                {loadingFull && !eco.auditLogs ? (
                  <div className="text-sm text-gainsboro-400 py-4 text-center">Loading audit history...</div>
                ) : (
                  <AuditTimeline logs={eco.auditLogs} />
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center flex-shrink-0">
        <Icon size={14} className="text-gainsboro-400" />
      </div>
      <div>
        <p className="text-xs text-gainsboro-500">{label}</p>
        <p className="text-sm text-gainsboro-200">{value}</p>
      </div>
    </div>
  );
}
