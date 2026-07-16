import { Clock, User, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const actionIcons = {
  eco_created: AlertCircle,
  stage_moved: ArrowRight,
  eco_approved: CheckCircle,
  eco_rejected: XCircle,
  eco_applied: CheckCircle,
  version_created: AlertCircle,
  version_archived: AlertCircle,
};

const actionColors = {
  eco_created: 'bg-blue-500',
  stage_moved: 'bg-purple-500',
  eco_approved: 'bg-emerald-500',
  eco_rejected: 'bg-red-500',
  eco_applied: 'bg-sienna-500',
  version_created: 'bg-xanadu-500',
  version_archived: 'bg-gainsboro-500',
};

function formatAction(log) {
  const actions = {
    eco_created: 'ECO Created',
    stage_moved: 'Stage Moved',
    eco_approved: 'Approved',
    eco_rejected: 'Rejected',
    eco_applied: 'ECO Applied',
    version_created: 'Version Created',
    version_archived: 'Version Archived',
  };
  return actions[log.action] || log.action;
}

function formatDetails(log) {
  if (log.old_value && log.new_value) {
    const oldStage = log.old_value?.stage;
    const newStage = log.new_value?.stage;
    if (oldStage && newStage) return `${oldStage} → ${newStage}`;
    
    const oldStatus = log.old_value?.status;
    const newStatus = log.new_value?.status;
    if (oldStatus && newStatus) return `${oldStatus} → ${newStatus}`;

    const version = log.new_value?.version;
    if (version) return `Version ${version}`;
  }
  if (log.new_value?.title) return log.new_value.title;
  if (log.new_value?.name) return `${log.new_value.name} ${log.new_value.version || ''}`;
  return '';
}

export default function AuditTimeline({ logs }) {
  if (!logs || logs.length === 0) {
    return <p className="text-sm text-gainsboro-500">No audit history available</p>;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-navy-600" />

      <div className="space-y-4">
        {logs.map((log, i) => {
          const Icon = actionIcons[log.action] || AlertCircle;
          const dotColor = actionColors[log.action] || 'bg-gainsboro-500';
          const details = formatDetails(log);

          return (
            <div key={log.id || i} className="flex gap-4 relative">
              {/* Dot */}
              <div className={`w-10 h-10 rounded-full ${dotColor} flex items-center justify-center flex-shrink-0 z-10 shadow-lg`}>
                <Icon size={16} className="text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gainsboro-200">
                    {formatAction(log)}
                  </span>
                  {details && (
                    <span className="text-xs text-gainsboro-400 bg-navy-700 px-2 py-0.5 rounded">
                      {details}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gainsboro-500">
                    <User size={12} />
                    {log.user_name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gainsboro-500">
                    <Clock size={12} />
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
