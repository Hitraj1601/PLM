import { computeComponentDiff, computeOperationDiff, computeProductDiff } from '../../utils/diffUtils';
import { ArrowRight, Plus, Minus, Equal } from 'lucide-react';

export default function DiffViewer({ eco }) {
  if (!eco || !eco.changes) return null;

  if (eco.eco_type === 'bom') {
    return <BomDiffView eco={eco} />;
  }
  return <ProductDiffView eco={eco} />;
}

function BomDiffView({ eco }) {
  const componentDiff = computeComponentDiff(eco.bomData?.components, eco.changes);
  const operationDiff = computeOperationDiff(eco.bomData?.operations, eco.changes);

  return (
    <div className="space-y-6">
      {/* Component Changes */}
      <div>
        <h4 className="text-sm font-semibold text-gainsboro-300 mb-3">Component Changes</h4>
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-600">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase">Component</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gainsboro-400 uppercase">Old Qty</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gainsboro-400 uppercase">New Qty</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gainsboro-400 uppercase">Δ Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/50">
              {componentDiff.map((item, i) => {
                const borderColor =
                  item.type === 'added' ? 'border-l-4 border-l-emerald-500' :
                  item.type === 'removed' ? 'border-l-4 border-l-red-500' :
                  item.type === 'modified' ? 'border-l-4 border-l-amber-500' :
                  'border-l-4 border-l-gainsboro-600';

                return (
                  <tr key={i} className={`${borderColor} transition-colors hover:bg-navy-700/50`}>
                    <td className="px-4 py-2.5 text-sm text-gainsboro-200 font-medium">
                      <div className="flex items-center gap-2">
                        {item.type === 'added' && <Plus size={14} className="text-emerald-400" />}
                        {item.type === 'removed' && <Minus size={14} className="text-red-400" />}
                        {item.component}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-gainsboro-400">
                      {item.oldQty !== null ? `${item.oldQty} ${item.unit || ''}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-right text-gainsboro-200">
                      {item.newQty !== null ? `${item.newQty} ${item.unit || ''}` : '—'}
                    </td>
                    <td className={`px-4 py-2.5 text-sm text-right font-semibold ${
                      item.delta > 0 ? 'text-emerald-400' :
                      item.delta < 0 ? 'text-red-400' :
                      'text-gainsboro-500'
                    }`}>
                      {item.delta > 0 ? `+${item.delta}` : item.delta === 0 ? '—' : item.delta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operation Changes */}
      {operationDiff.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gainsboro-300 mb-3">Operation Changes</h4>
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-navy-600">
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase">Operation</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold text-gainsboro-400 uppercase">Duration</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase">Work Center</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-gainsboro-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-600/50">
                {operationDiff.map((op, i) => {
                  const borderColor =
                    op.type === 'added' ? 'border-l-4 border-l-emerald-500' :
                    op.type === 'removed' ? 'border-l-4 border-l-red-500' :
                    'border-l-4 border-l-gainsboro-600';

                  return (
                    <tr key={i} className={`${borderColor} transition-colors hover:bg-navy-700/50`}>
                      <td className="px-4 py-2.5 text-sm text-gainsboro-200 font-medium">
                        {op.type === 'added' && <Plus size={14} className="text-emerald-400 inline mr-1" />}
                        {op.type === 'removed' && <Minus size={14} className="text-red-400 inline mr-1" />}
                        {op.name}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-right text-gainsboro-300">{op.duration_mins} mins</td>
                      <td className="px-4 py-2.5 text-sm text-gainsboro-400">{op.work_center}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          op.type === 'added' ? 'bg-emerald-500/20 text-emerald-400' :
                          op.type === 'removed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gainsboro-500/20 text-gainsboro-400'
                        }`}>
                          {op.type}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDiffView({ eco }) {
  const { before, after } = computeProductDiff(
    { sale_price: eco.sale_price, cost_price: eco.cost_price, name: eco.product_name },
    eco.changes
  );

  const formatPrice = (v) => v != null ? `$${parseFloat(v).toFixed(2)}` : '—';

  return (
    <div>
      <h4 className="text-sm font-semibold text-gainsboro-300 mb-3">Product Changes</h4>
      <div className="grid grid-cols-2 gap-4">
        {/* Before Card */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <h5 className="text-xs font-semibold text-gainsboro-400 uppercase">Before</h5>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gainsboro-500">Name</label>
              <p className="text-sm text-gainsboro-300">{before.name || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gainsboro-500">Sale Price</label>
              <p className="text-sm text-gainsboro-300">{formatPrice(before.sale_price)}</p>
            </div>
            <div>
              <label className="text-xs text-gainsboro-500">Cost Price</label>
              <p className="text-sm text-gainsboro-300">{formatPrice(before.cost_price)}</p>
            </div>
          </div>
        </div>

        {/* After Card */}
        <div className="glass-card p-4 border-sienna-500/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h5 className="text-xs font-semibold text-gainsboro-400 uppercase">After</h5>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gainsboro-500">Name</label>
              <p className={`text-sm ${after.name !== before.name ? 'text-emerald-400 font-semibold' : 'text-gainsboro-300'}`}>
                {after.name || '—'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gainsboro-500">Sale Price</label>
              <p className={`text-sm ${after.sale_price !== before.sale_price ? 'text-emerald-400 font-semibold' : 'text-gainsboro-300'}`}>
                {formatPrice(after.sale_price)}
                {after.sale_price !== before.sale_price && (
                  <span className="ml-2 text-xs text-amber-400">
                    ({after.sale_price > before.sale_price ? '+' : ''}{(after.sale_price - before.sale_price).toFixed(2)})
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="text-xs text-gainsboro-500">Cost Price</label>
              <p className={`text-sm ${after.cost_price !== before.cost_price ? 'text-emerald-400 font-semibold' : 'text-gainsboro-300'}`}>
                {formatPrice(after.cost_price)}
                {after.cost_price !== before.cost_price && (
                  <span className="ml-2 text-xs text-amber-400">
                    ({after.cost_price > before.cost_price ? '+' : ''}{(after.cost_price - before.cost_price).toFixed(2)})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
