import { useState, useEffect } from 'react';
import { AlertTriangle, Package, GitBranch, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../api/axios';

export default function DependencyWarningCard({ ecoId }) {
  const [impacts, setImpacts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (ecoId) fetchImpacts();
  }, [ecoId]);

  const fetchImpacts = async () => {
    try {
      const res = await api.get(`/eco/${ecoId}/impacts`);
      setImpacts(res.data);
    } catch (err) {
      console.error('Failed to fetch impacts', err);
      setImpacts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-4 animate-pulse border-amber-500/20">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-amber-400/50" />
          <span className="text-sm text-gainsboro-400">Checking for downstream dependencies...</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-navy-700 rounded w-3/4" />
          <div className="h-3 bg-navy-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // If there are no impacts, we can either return null or show a "Safe" message.
  // Showing a subtle message builds confidence in the system.
  if (!impacts || impacts.length === 0) {
    return (
      <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
          <Package size={14} className="text-green-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gainsboro-200">No Downstream Dependencies</p>
          <p className="text-xs text-gainsboro-400">This product is not currently used as a component in any active BOMs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 overflow-hidden transition-all duration-300">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-sm font-semibold text-gainsboro-200">Impact Analysis / Dependencies</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {impacts.length} Affected
          </span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-gainsboro-500" /> : <ChevronDown size={14} className="text-gainsboro-500" />}
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <p className="text-xs text-gainsboro-300 mb-4 leading-relaxed">
            Changing this product will affect the following parent products because it is used as a component in their active Bill of Materials. Consider if these parent products also need new versions.
          </p>

          <div className="space-y-2">
            {impacts.map((impact, idx) => (
              <div key={idx} className="bg-navy-800/60 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-amber-400" />
                    <span className="text-sm font-semibold text-gainsboro-200">{impact.parent_product_name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-navy-700 text-gainsboro-400 border border-navy-600">
                    Product v{impact.product_version}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mt-2 pl-6">
                  <div className="flex items-center gap-1.5 text-xs text-gainsboro-400">
                    <Layers size={12} className="text-gainsboro-500" />
                    BOM v{impact.bom_version}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gainsboro-400">
                    <GitBranch size={12} className="text-gainsboro-500" />
                    {impact.bom_status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
