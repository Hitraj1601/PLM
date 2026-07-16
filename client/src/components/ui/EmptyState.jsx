import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message = '', action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-navy-700 flex items-center justify-center mb-4">
        <Icon size={32} className="text-gainsboro-500" />
      </div>
      <h3 className="text-lg font-semibold text-gainsboro-300 mb-1">{title}</h3>
      {message && <p className="text-sm text-gainsboro-500 max-w-sm">{message}</p>}
      {action && (
        <button
          onClick={action}
          className="mt-4 px-4 py-2 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
