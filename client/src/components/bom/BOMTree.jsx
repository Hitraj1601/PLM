import { useState } from 'react';
import { ChevronRight, ChevronDown, Layers, Box, Cpu, DollarSign } from 'lucide-react';

export default function BOMTree({ components = [], operations = [] }) {
  const [expandedNodes, setExpandedNodes] = useState({});

  const toggleNode = (id) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!components.length && !operations.length) {
    return (
      <div className="p-8 text-center text-gainsboro-500 text-sm">
        No components or routing operations defined in this Bill of Materials.
      </div>
    );
  }

  // Calculate total estimated cost
  const totalMaterialCost = components.reduce((sum, c) => sum + (parseFloat(c.cost || 0) * parseFloat(c.quantity || 1)), 0);
  const totalOpsCost = operations.reduce((sum, o) => sum + (parseFloat(o.cost || 0)), 0);
  const totalCost = totalMaterialCost + totalOpsCost;

  return (
    <div className="space-y-6">
      {/* Cost summary card */}
      <div className="grid grid-cols-3 gap-4 bg-navy-950/60 p-4 rounded-xl border border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sienna-500/20 text-sienna-400 flex items-center justify-center">
            <Box size={20} />
          </div>
          <div>
            <p className="text-xs text-gainsboro-400">Total Components</p>
            <p className="text-lg font-bold text-gainsboro-100">{components.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Cpu size={20} />
          </div>
          <div>
            <p className="text-xs text-gainsboro-400">Operations / Routing</p>
            <p className="text-lg font-bold text-gainsboro-100">{operations.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs text-gainsboro-400">Est. Total Cost</p>
            <p className="text-lg font-bold text-emerald-400">${totalCost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Hierarchical Components Tree */}
      <div className="bg-navy-900/40 rounded-xl border border-navy-700 p-4">
        <h4 className="text-sm font-semibold text-gainsboro-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers size={16} className="text-sienna-400" /> Component Structure
        </h4>

        <div className="space-y-2">
          {components.map((comp, idx) => {
            const nodeId = comp.id || `comp-${idx}`;
            const isExpanded = expandedNodes[nodeId];

            return (
              <div key={nodeId} className="border border-navy-700/60 rounded-lg bg-navy-950/40 overflow-hidden">
                <div 
                  onClick={() => toggleNode(nodeId)}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-navy-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button className="text-gainsboro-400 hover:text-gainsboro-200">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    <Box size={16} className="text-sienna-400" />
                    <span className="font-semibold text-sm text-gainsboro-100">{comp.component_name || comp.name || 'Component'}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gainsboro-400">
                    <span className="bg-navy-800 px-2 py-1 rounded text-gainsboro-300 font-mono">
                      Qty: {comp.quantity || 1}
                    </span>
                    {comp.cost && (
                      <span className="text-emerald-400 font-semibold">
                        ${(parseFloat(comp.cost) * parseFloat(comp.quantity || 1)).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-9 py-3 border-t border-navy-800 bg-navy-900/60 text-xs space-y-1.5 text-gainsboro-400">
                    <p><strong className="text-gainsboro-300">Part Number:</strong> {comp.part_number || 'N/A'}</p>
                    <p><strong className="text-gainsboro-300">Unit Cost:</strong> ${comp.cost || '0.00'}</p>
                    {comp.notes && <p><strong className="text-gainsboro-300">Notes:</strong> {comp.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Routing Operations List */}
      {operations.length > 0 && (
        <div className="bg-navy-900/40 rounded-xl border border-navy-700 p-4">
          <h4 className="text-sm font-semibold text-gainsboro-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu size={16} className="text-blue-400" /> Routing Operations
          </h4>
          <div className="space-y-2">
            {operations.map((op, idx) => (
              <div key={op.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-navy-950/40 border border-navy-700/60">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                    {op.sequence || idx + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gainsboro-200">{op.name || op.operation_name || 'Operation'}</p>
                    {op.work_center && <p className="text-xs text-gainsboro-500">Work Center: {op.work_center}</p>}
                  </div>
                </div>
                <div className="text-xs font-mono text-emerald-400">
                  ${parseFloat(op.cost || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
