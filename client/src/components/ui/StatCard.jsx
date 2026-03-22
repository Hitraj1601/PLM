import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, className = '', onClick }) {
  const Component = onClick ? 'button' : 'div';
  const interactiveClasses = onClick ? 'hover:bg-navy-800 transition-colors cursor-pointer text-left w-full hover:-translate-y-1 hover:shadow-lg hover:shadow-sienna-600/10' : '';

  return (
    <Component onClick={onClick} className={`glass-card p-6 block ${interactiveClasses} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gainsboro-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gainsboro-100 mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend === 'up' ? 'text-xanadu-400' : 'text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-sienna-500/10 flex items-center justify-center">
            <Icon size={24} className="text-sienna-400" />
          </div>
        )}
      </div>
    </Component>
  );
}
