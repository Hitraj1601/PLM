const badgeStyles = {
  active: 'bg-xanadu-500/20 text-xanadu-400',
  archived: 'bg-gainsboro-500/20 text-gainsboro-400',
  new: 'bg-blue-500/20 text-blue-400',
  'in review': 'bg-purple-500/20 text-purple-400',
  approval: 'bg-amber-500/20 text-amber-400',
  done: 'bg-sienna-500/20 text-sienna-400',
  applied: 'bg-sienna-500/20 text-sienna-400',
  rejected: 'bg-red-500/20 text-red-400',
  open: 'bg-blue-500/20 text-blue-400',
  product: 'bg-purple-500/20 text-purple-400',
  bom: 'bg-xanadu-500/20 text-xanadu-400',
};

export default function Badge({ status, className = '' }) {
  const key = status?.toLowerCase?.() || '';
  const style = badgeStyles[key] || 'bg-gainsboro-500/20 text-gainsboro-400';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style} ${className}`}>
      {status}
    </span>
  );
}
