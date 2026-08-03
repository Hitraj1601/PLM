export default function SkeletonLoader({ count = 3, type = 'card' }) {
  if (type === 'table') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-12 bg-navy-700/50 rounded-lg w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-6 space-y-4">
          <div className="h-4 bg-navy-700/60 rounded w-1/3" />
          <div className="h-8 bg-navy-700/80 rounded w-2/3" />
          <div className="h-3 bg-navy-700/40 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
