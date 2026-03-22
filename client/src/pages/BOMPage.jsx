import { useState, useEffect } from 'react';
import { Plus, Layers, ChevronDown, ChevronUp, X, Search, Filter } from 'lucide-react';
import useBOM from '../hooks/useBOM';
import useEcoStore from '../store/ecoStore';
import useAuthStore from '../store/authStore';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';

export default function BOMPage() {
  const { boms, bomsMeta, page, setPage, search, setSearch, filters, setFilters, handleCreate } = useBOM();
  const { products, fetchProducts } = useEcoStore();
  const { user } = useAuthStore();
  const [expandedBom, setExpandedBom] = useState(null);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ product_id: '', name: '', version: 'v1', components: [{ component_name: '', quantity: '', unit: 'pcs' }], operations: [{ name: '', duration_mins: '', work_center: '' }] });

  const canEdit = user?.role === 'engineering' || user?.role === 'admin';
  const activeProducts = (products || []).filter((p) => p.status === 'active');

  const addComponent = () => setForm({ ...form, components: [...form.components, { component_name: '', quantity: '', unit: 'pcs' }] });
  const addOperation = () => setForm({ ...form, operations: [...form.operations, { name: '', duration_mins: '', work_center: '' }] });
  const removeComponent = (index) => {
    if (form.components.length > 1) {
      setForm({ ...form, components: form.components.filter((_, i) => i !== index) });
    }
  };
  const removeOperation = (index) => {
    if (form.operations.length > 1) {
      setForm({ ...form, operations: form.operations.filter((_, i) => i !== index) });
    }
  };
  const updateComponent = (i, field, val) => {
    const comps = [...form.components];
    comps[i][field] = val;
    setForm({ ...form, components: comps });
  };
  const updateOperation = (i, field, val) => {
    const ops = [...form.operations];
    ops[i][field] = val;
    setForm({ ...form, operations: ops });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const data = {
        ...form,
        components: form.components.filter((c) => c.component_name),
        operations: form.operations.filter((o) => o.name),
      };
      await handleCreate(data);
      setShowModal(false);
      setForm({ product_id: '', name: '', version: 'v1', components: [{ component_name: '', quantity: '', unit: 'pcs' }], operations: [{ name: '', duration_mins: '', work_center: '' }] });
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'product_name', label: 'Product', render: (v) => <span className="font-medium text-gainsboro-200">{v || '—'}</span> },
    { key: 'version', label: 'Version', render: (v) => <span className="text-sienna-400 font-mono text-xs">{v}</span> },
    { key: 'components', label: 'Components', render: (v) => <span className="text-gainsboro-400">{v ? (Array.isArray(v) ? v.length : JSON.parse(v || '[]').length) : 0} items</span> },
    { key: 'operations', label: 'Operations', render: (v) => <span className="text-gainsboro-400">{v ? (Array.isArray(v) ? v.length : JSON.parse(v || '[]').length) : 0} ops</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
  ];

  const inputClass = 'w-full bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none';
  const filterSelectClass = 'bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent px-3 py-2';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gainsboro-100">Bill of Materials</h1>
          <p className="text-sm text-gainsboro-400 mt-1">{bomsMeta?.total || boms.length} BoMs total</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Column Filters */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-gainsboro-500" />
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className={filterSelectClass}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="deprecated">Deprecated</option>
            </select>
          </div>
          {/* Search input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
            <input
              type="text"
              placeholder="Search BoMs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 placeholder-gainsboro-500 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent w-56"
            />
          </div>
          {canEdit && (
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors">
              <Plus size={16} /> New BoM
            </button>
          )}
        </div>
      </div>

      {boms.length === 0 ? (
        <EmptyState icon={Layers} title="No BoMs yet" message="Create your first BoM" action={canEdit ? () => setShowModal(true) : undefined} actionLabel="New BoM" />
      ) : (
        <div className="space-y-3">
          {boms.map((bom) => {
            const isExpanded = expandedBom === bom.id;
            const components = bom.components ? (Array.isArray(bom.components) ? bom.components : []) : [];
            const operations = bom.operations ? (Array.isArray(bom.operations) ? bom.operations : []) : [];

            return (
              <div key={bom.id} className="glass-card overflow-hidden">
                <button
                  onClick={() => setExpandedBom(isExpanded ? null : bom.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-navy-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gainsboro-200">{bom.product_name || 'Unknown'} {bom.name ? `— ${bom.name}` : ''}</span>
                    <span className="text-sienna-400 font-mono text-xs">{bom.version}</span>
                    <Badge status={bom.status} />
                    <span className="text-xs text-gainsboro-500">{components.length} components · {operations.length} operations</span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-gainsboro-400" /> : <ChevronDown size={16} className="text-gainsboro-400" />}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-navy-600 pt-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-semibold text-gainsboro-400 uppercase mb-2">Components</h4>
                        <div className="space-y-1.5">
                          {components.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-navy-700/50 rounded-lg px-3 py-2">
                              <span className="text-sm text-gainsboro-200">{c.component_name}</span>
                              <span className="text-xs text-gainsboro-400">{c.quantity} {c.unit}</span>
                            </div>
                          ))}
                          {components.length === 0 && <p className="text-xs text-gainsboro-500">No components</p>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gainsboro-400 uppercase mb-2">Operations</h4>
                        <div className="space-y-1.5">
                          {operations.map((o, i) => (
                            <div key={i} className="flex items-center justify-between bg-navy-700/50 rounded-lg px-3 py-2">
                              <span className="text-sm text-gainsboro-200">{o.name}</span>
                              <span className="text-xs text-gainsboro-400">{o.duration_mins} mins · {o.work_center}</span>
                            </div>
                          ))}
                          {operations.length === 0 && <p className="text-xs text-gainsboro-500">No operations</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <Pagination meta={bomsMeta} onPageChange={setPage} />
        </div>
      )}

      {/* Create BoM Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Bill of Materials" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Product</label>
              <select className={inputClass} value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} required>
                <option value="">Select...</option>
                {activeProducts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.version})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">BoM Name (Optional)</label>
              <input className={inputClass} placeholder="e.g. Standard Variant" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Version</label>
              <input className={inputClass} value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gainsboro-400">Components</label>
              <button type="button" onClick={addComponent} className="text-xs text-sienna-400 hover:text-sienna-300">+ Add</button>
            </div>
            {form.components.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_80px_32px] gap-2 mb-2 items-center">
                <input className={inputClass} placeholder="Name" value={c.component_name} onChange={(e) => updateComponent(i, 'component_name', e.target.value)} />
                <input type="number" className={inputClass} placeholder="Qty" value={c.quantity} onChange={(e) => updateComponent(i, 'quantity', e.target.value)} />
                <input className={inputClass} placeholder="Unit" value={c.unit} onChange={(e) => updateComponent(i, 'unit', e.target.value)} />
                <button type="button" onClick={() => removeComponent(i)} disabled={form.components.length === 1} className="p-1 text-gainsboro-500 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gainsboro-400">Operations</label>
              <button type="button" onClick={addOperation} className="text-xs text-sienna-400 hover:text-sienna-300">+ Add</button>
            </div>
            {form.operations.map((o, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_1fr_32px] gap-2 mb-2 items-center">
                <input className={inputClass} placeholder="Name" value={o.name} onChange={(e) => updateOperation(i, 'name', e.target.value)} />
                <input type="number" className={inputClass} placeholder="Duration (mins)" value={o.duration_mins} onChange={(e) => updateOperation(i, 'duration_mins', e.target.value)} />
                <input className={inputClass} placeholder="Work Center" value={o.work_center} onChange={(e) => updateOperation(i, 'work_center', e.target.value)} />
                <button type="button" onClick={() => removeOperation(i)} disabled={form.operations.length === 1} className="p-1 text-gainsboro-500 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create BoM'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
