import Badge from '../ui/Badge';
import { Calendar, User, GitPullRequest, Clock } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function ECOCard({ eco, onClick }) {
  const { user } = useAuthStore();
  const isApproverOrAdmin = user?.role === 'approver' || user?.role === 'admin';
  const isPendingApproval = isApproverOrAdmin && (eco.stage_name === 'Approval' || eco.stage_name === 'In Review' || eco.status === 'pending');

  return (
    <div
      onClick={() => onClick?.(eco)}
      className={`glass-card p-4 cursor-pointer transition-all group ${
        isPendingApproval ? 'border-l-4 border-l-amber-500 hover:border-amber-400 bg-amber-500/5' : 'hover:border-sienna-500/30'
      }`}
    >
      {isPendingApproval && (
        <div className="mb-2.5 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[11px] font-extrabold flex items-center gap-1.5 border border-amber-500/30">
          <Clock size={12} className="live-pulse" />
          <span>⚡ Action Required: Pending Approval</span>
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-semibold text-gainsboro-200 group-hover:text-sienna-300 transition-colors line-clamp-2">
          {eco.title}
        </h4>
        <Badge status={eco.eco_type} />
      </div>

      <div className="space-y-1.5 mt-3">
        <div className="flex items-center gap-2 text-xs text-gainsboro-400">
          <GitPullRequest size={12} />
          <span>{eco.product_name || 'Unknown Product'}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gainsboro-400">
          <User size={12} />
          <span>{eco.creator_name || 'Unassigned'}</span>
        </div>
        {eco.effective_date && (
          <div className="flex items-center gap-2 text-xs text-gainsboro-400">
            <Calendar size={12} />
            <span>{new Date(eco.effective_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-navy-600 flex items-center justify-between">
        <Badge status={eco.stage_name || eco.status} />
        {isPendingApproval && (
          <span className="text-xs font-bold text-amber-400 group-hover:underline">Review →</span>
        )}
      </div>
    </div>
  );
}
