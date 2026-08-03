import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, trend, trendValue, className = '', onClick }) {
  const Component = onClick ? 'button' : 'div';
  const interactiveClasses = onClick ? 'hover:bg-navy-700/60 transition-all cursor-pointer text-left w-full hover:-translate-y-1 hover:shadow-xl hover:shadow-sienna-600/10 hover:border-sienna-500/40' : '';

  return (
    <Component onClick={onClick} className={`glass-card p-6 block ${interactiveClasses} ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gainsboro-400 font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-gainsboro-100 mt-2 tracking-tight">{value}</p>
          {trend && (
            <div className={`inline-flex items-center gap-1.5 mt-3 px-2 py-0.5 rounded-md text-xs font-semibold ${
              trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
            }`}>
              {trend === 'up' ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sienna-500/20 to-sienna-600/10 border border-sienna-500/20 flex items-center justify-center shadow-xs">
            <Icon size={22} className="text-sienna-500" />
          </div>
        )}
      </div>
    </Component>
  );
}
