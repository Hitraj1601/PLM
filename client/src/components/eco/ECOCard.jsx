import Badge from '../ui/Badge';
import { Calendar, User, GitPullRequest } from 'lucide-react';

export default function ECOCard({ eco, onClick }) {
  return (
    <div
      onClick={() => onClick?.(eco)}
      className="glass-card p-4 cursor-pointer hover:border-sienna-500/30 transition-all group"
    >
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

      <div className="mt-3 pt-3 border-t border-navy-600">
        <Badge status={eco.stage_name || eco.status} />
      </div>
    </div>
  );
}
