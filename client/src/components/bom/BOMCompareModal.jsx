import { useState, useMemo } from 'react';
import { Layers, ArrowRight, Plus, Minus, Search, Columns, Rows, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Modal from '../ui/Modal';
import { compareTwoBOMs } from '../../utils/diffUtils';

export default function BOMCompareModal({ isOpen, onClose, boms = [] }) {
  const [baseBomId, setBaseBomId] = useState('');
  const [targetBomId, setTargetBomId] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'added' | 'removed' | 'modified'
  const [viewMode, setViewMode] = useState('unified'); // 'unified' | 'split'
  const [searchTerm, setSearchTerm] = useState('');

  // Default base and target BOM selection
  useMemo(() => {
    if (boms.length > 0 && !baseBomId) {
      setBaseBomId(String(boms[0].id));
      if (boms.length > 1) {
        setTargetBomId(String(boms[1].id));
      } else {
        setTargetBomId(String(boms[0].id));
      }
    }
  }, [boms, baseBomId]);

  const baseBom = useMemo(() => boms.find((b) => String(b.id) === String(baseBomId)), [boms, baseBomId]);
  const targetBom = useMemo(() => boms.find((b) => String(b.id) === String(targetBomId)), [boms, targetBomId]);

  const diffResult = useMemo(() => {
    if (!baseBom || !targetBom) return null;
    return compareTwoBOMs(baseBom, targetBom);
  }, [baseBom, targetBom]);

  const filteredComponents = useMemo(() => {
    if (!diffResult) return [];
    return diffResult.componentDiff.filter((item) => {
      // Filter by type
      if (filterType !== 'all' && item.type !== filterType) return false;
      // Search term filter
      if (searchTerm.trim() && !item.component.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [diffResult, filterType, searchTerm]);

  const filteredOperations = useMemo(() => {
    if (!diffResult) return [];
    return diffResult.operationDiff.filter((item) => {
      if (filterType !== 'all' && item.type !== filterType) return false;
      if (searchTerm.trim() && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [diffResult, filterType, searchTerm]);

  const summary = diffResult?.summary || {
    addedCount: 0,
    removedCount: 0,
    modifiedCount: 0,
    unchangedCount: 0,
    totalChanges: 0,
    partsDelta: 0,
  };

  const selectClass = 'w-full bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sienna-500';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Visual BOM Comparison & Version Diff" size="max-w-5xl">
      <div className="space-y-6">
        {/* Revision Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-navy-900 p-4 rounded-xl border border-navy-600">
          <div>
            <label className="block text-xs font-semibold text-gainsboro-400 mb-1">
              Base BOM (Revision A)
            </label>
            <select value={baseBomId} onChange={(e) => setBaseBomId(e.target.value)} className={selectClass}>
              {boms.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.product_name || 'BOM'} — {b.version} ({b.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gainsboro-400 mb-1">
              Target BOM (Revision B)
            </label>
            <select value={targetBomId} onChange={(e) => setTargetBomId(e.target.value)} className={selectClass}>
              {boms.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.product_name || 'BOM'} — {b.version} ({b.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-navy-800/80 p-3.5 rounded-xl border border-navy-600 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sienna-500/20 text-sienna-400 flex items-center justify-center font-bold text-base">
              {summary.partsDelta > 0 ? `+${summary.partsDelta}` : summary.partsDelta}
            </div>
            <div>
              <p className="text-xs text-gainsboro-400 font-semibold">Parts Delta</p>
              <p className="text-sm font-extrabold text-gainsboro-100">
                {summary.partsDelta === 0 ? 'No change' : `${summary.partsDelta > 0 ? '+' : ''}${summary.partsDelta} items`}
              </p>
            </div>
          </div>

          <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base">
              +{summary.addedCount}
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-semibold">Added Parts</p>
              <p className="text-sm font-extrabold text-emerald-300">{summary.addedCount} new</p>
            </div>
          </div>

          <div className="bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-base">
              -{summary.removedCount}
            </div>
            <div>
              <p className="text-xs text-red-400 font-semibold">Removed Parts</p>
              <p className="text-sm font-extrabold text-red-300">{summary.removedCount} removed</p>
            </div>
          </div>

          <div className="bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">
              {summary.modifiedCount}
            </div>
            <div>
              <p className="text-xs text-amber-400 font-semibold">Modified Parts</p>
              <p className="text-sm font-extrabold text-amber-300">{summary.modifiedCount} modified</p>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filter Tabs, View Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: 'all', label: `All (${diffResult?.componentDiff.length || 0})` },
              { id: 'added', label: `Added (${summary.addedCount})` },
              { id: 'removed', label: `Removed (${summary.removedCount})` },
              { id: 'modified', label: `Modified (${summary.modifiedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-sienna-600 text-white'
                    : 'bg-navy-800 text-gainsboro-400 hover:text-gainsboro-200 hover:bg-navy-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & View Mode Switcher */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="relative flex-1 sm:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search part..."
                className="w-full bg-navy-800 border border-navy-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gainsboro-100 placeholder-gainsboro-500 outline-none focus:ring-1 focus:ring-sienna-500"
              />
            </div>

            <div className="flex items-center bg-navy-800 p-1 rounded-lg border border-navy-600">
              <button
                onClick={() => setViewMode('unified')}
                title="Unified Diff View"
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'unified' ? 'bg-navy-700 text-sienna-400' : 'text-gainsboro-400 hover:text-gainsboro-200'
                }`}
              >
                <Rows size={14} /> Unified
              </button>
              <button
                onClick={() => setViewMode('split')}
                title="Side-by-Side View"
                className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                  viewMode === 'split' ? 'bg-navy-700 text-sienna-400' : 'text-gainsboro-400 hover:text-gainsboro-200'
                }`}
              >
                <Columns size={14} /> Split
              </button>
            </div>
          </div>
        </div>

        {/* Component Comparison Output */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gainsboro-300 uppercase tracking-wider">Component Comparison</h4>

          {filteredComponents.length === 0 ? (
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-8 text-center text-gainsboro-400">
              <p className="text-sm">No components matching filter criteria.</p>
            </div>
          ) : viewMode === 'unified' ? (
            /* UNIFIED VIEW */
            <div className="glass-card overflow-hidden border border-navy-600 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-navy-800 border-b border-navy-600 text-gainsboro-400 uppercase font-semibold">
                    <th className="px-4 py-3">Component Name</th>
                    <th className="px-4 py-3 text-right">Base Qty (Rev A)</th>
                    <th className="px-4 py-3 text-right">Target Qty (Rev B)</th>
                    <th className="px-4 py-3 text-right">Δ Delta</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/50">
                  {filteredComponents.map((item, idx) => {
                    const isAdded = item.type === 'added';
                    const isRemoved = item.type === 'removed';
                    const isModified = item.type === 'modified';

                    const borderClass = isAdded
                      ? 'border-l-4 border-l-emerald-500 bg-emerald-500/5'
                      : isRemoved
                      ? 'border-l-4 border-l-red-500 bg-red-500/5'
                      : isModified
                      ? 'border-l-4 border-l-amber-500 bg-amber-500/5'
                      : 'border-l-4 border-l-transparent';

                    return (
                      <tr key={idx} className={`${borderClass} hover:bg-navy-700/40 transition-colors`}>
                        <td className="px-4 py-3 font-semibold text-gainsboro-100 flex items-center gap-2">
                          {isAdded && <Plus size={14} className="text-emerald-400" />}
                          {isRemoved && <Minus size={14} className="text-red-400" />}
                          {isModified && <RefreshCw size={14} className="text-amber-400" />}
                          <span>{item.component}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-gainsboro-400 font-mono">
                          {item.oldQty !== null ? `${item.oldQty} ${item.unit}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right text-gainsboro-200 font-mono">
                          {item.newQty !== null ? `${item.newQty} ${item.unit}` : '—'}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono font-bold ${
                            item.delta > 0
                              ? 'text-emerald-400'
                              : item.delta < 0
                              ? 'text-red-400'
                              : 'text-gainsboro-500'
                          }`}
                        >
                          {item.delta > 0 ? `+${item.delta}` : item.delta === 0 ? '—' : item.delta}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              isAdded
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isRemoved
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : isModified
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-navy-700 text-gainsboro-400 border-navy-600'
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* SPLIT SIDE-BY-SIDE VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Base BOM Column */}
              <div className="glass-card border border-navy-600 rounded-xl overflow-hidden">
                <div className="bg-navy-800 p-3 border-b border-navy-600 flex items-center justify-between">
                  <span className="text-xs font-bold text-gainsboro-200">
                    Base: {baseBom?.product_name} ({baseBom?.version})
                  </span>
                  <span className="text-xs text-gainsboro-400">{filteredComponents.filter(c => c.oldQty !== null).length} items</span>
                </div>
                <div className="divide-y divide-navy-700/50">
                  {filteredComponents.map((item, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-navy-700/30">
                      <span className={`font-semibold ${item.type === 'removed' ? 'text-red-400 line-through' : 'text-gainsboro-200'}`}>
                        {item.component}
                      </span>
                      <span className="font-mono text-gainsboro-400">
                        {item.oldQty !== null ? `${item.oldQty} ${item.unit}` : '— Not Present'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target BOM Column */}
              <div className="glass-card border border-navy-600 rounded-xl overflow-hidden">
                <div className="bg-navy-800 p-3 border-b border-navy-600 flex items-center justify-between">
                  <span className="text-xs font-bold text-gainsboro-200">
                    Target: {targetBom?.product_name} ({targetBom?.version})
                  </span>
                  <span className="text-xs text-gainsboro-400">{filteredComponents.filter(c => c.newQty !== null).length} items</span>
                </div>
                <div className="divide-y divide-navy-700/50">
                  {filteredComponents.map((item, idx) => (
                    <div key={idx} className="p-3 text-xs flex items-center justify-between hover:bg-navy-700/30">
                      <span className={`font-semibold ${item.type === 'added' ? 'text-emerald-400' : 'text-gainsboro-200'}`}>
                        {item.component}
                      </span>
                      <span className="font-mono text-gainsboro-200">
                        {item.newQty !== null ? `${item.newQty} ${item.unit}` : '— Removed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Operations Comparison Output */}
        {filteredOperations.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-gainsboro-300 uppercase tracking-wider">Manufacturing Operations Comparison</h4>
            <div className="glass-card overflow-hidden border border-navy-600 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-navy-800 border-b border-navy-600 text-gainsboro-400 uppercase font-semibold">
                    <th className="px-4 py-3">Operation Name</th>
                    <th className="px-4 py-3 text-right">Base Duration</th>
                    <th className="px-4 py-3 text-right">Target Duration</th>
                    <th className="px-4 py-3 text-left">Work Center</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/50">
                  {filteredOperations.map((op, idx) => (
                    <tr key={idx} className="hover:bg-navy-700/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gainsboro-200">{op.name}</td>
                      <td className="px-4 py-3 text-right text-gainsboro-400 font-mono">
                        {op.oldDuration !== null ? `${op.oldDuration} mins` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gainsboro-200 font-mono">
                        {op.newDuration !== null ? `${op.newDuration} mins` : '—'}
                      </td>
                      <td className="px-4 py-3 text-gainsboro-400">{op.newWorkCenter || op.oldWorkCenter || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            op.type === 'added'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : op.type === 'removed'
                              ? 'bg-red-500/10 text-red-400'
                              : op.type === 'modified'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-navy-700 text-gainsboro-400'
                          }`}
                        >
                          {op.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
