import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import useEcoStore from '../../store/ecoStore';
import { ChevronRight, ChevronLeft, Plus, Trash2 } from 'lucide-react';

export default function NewECOModal({ isOpen, onClose, onSubmit }) {
  const { products, boms, fetchProducts, fetchBoms } = useEcoStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', eco_type: 'product', product_id: '', bom_id: '',
    effective_date: '', version_update: true, changes: [],
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBom, setSelectedBom] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchBoms();
      setStep(1);
      setForm({ title: '', eco_type: 'product', product_id: '', bom_id: '', effective_date: '', version_update: true, changes: [] });
    }
  }, [isOpen]);

  const activeProducts = products.filter((p) => p.status === 'active');
  const activeBoms = boms.filter((b) => b.status === 'active');
  const filteredBoms = form.product_id
    ? activeBoms.filter((b) => b.product_id === form.product_id)
    : activeBoms;

  const handleProductSelect = (productId) => {
    const prod = products.find((p) => p.id === productId);
    setSelectedProduct(prod);
    setForm({ ...form, product_id: productId, bom_id: '' });
  };

  const handleBomSelect = (bomId) => {
    const bom = boms.find((b) => b.id === bomId);
    setSelectedBom(bom);
    
    // Auto-select the corresponding product for the chosen BoM
    if (bom && bom.product_id) {
      const prod = products.find((p) => p.id === bom.product_id);
      setSelectedProduct(prod);
      setForm({ ...form, bom_id: bomId, product_id: bom.product_id });
    } else {
      setForm({ ...form, bom_id: bomId });
    }
  };

  const addPriceChange = (field, oldVal, newVal) => {
    const existing = form.changes.filter((c) => c.field_name !== field);
    existing.push({ change_type: 'price', field_name: field, old_value: String(oldVal), new_value: String(newVal) });
    setForm({ ...form, changes: existing });
  };

  const addComponentChange = (type, componentName, oldVal, newVal) => {
    let field = type === 'component_qty' ? 'quantity' : 'component';
    if (type === 'lifecycle') field = 'status';

    let updatedChanges = form.changes;
    if (type === 'lifecycle') {
      updatedChanges = updatedChanges.filter(c => c.field_name !== 'status');
    }

    setForm({
      ...form,
      changes: [...updatedChanges, { change_type: type, field_name: field, old_value: oldVal, new_value: newVal, component_name: componentName }],
    });
  };

  const removeChange = (index) => {
    setForm({ ...form, changes: form.changes.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // Ensure version_update is a proper boolean before submitting
      await onSubmit({ ...form, version_update: Boolean(form.version_update) });
      onClose();
    } catch (err) {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = 'w-full bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none';
  const labelClass = 'block text-xs font-semibold text-gainsboro-400 mb-1.5';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Engineering Change Order" size="lg">
      {/* Step indicators */}
      <div className="flex items-center gap-4 mb-6">
        {['Basic Info', 'Propose Changes', 'Review'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step > i + 1 ? 'bg-sienna-600 text-white' :
              step === i + 1 ? 'bg-sienna-600/30 border border-sienna-500 text-sienna-300' :
              'bg-navy-700 text-gainsboro-500'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium ${step === i + 1 ? 'text-gainsboro-200' : 'text-gainsboro-500'}`}>{label}</span>
            {i < 2 && <ChevronRight size={14} className="text-gainsboro-600 ml-2" />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input className={inputClass} placeholder="e.g. Screw count increase for Table v1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>ECO Type</label>
            <div className="flex gap-3">
              {['product', 'bom'].map((t) => (
                <button key={t} onClick={() => setForm({ ...form, eco_type: t, changes: [] })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.eco_type === t ? 'bg-sienna-600 text-white' : 'bg-navy-700 text-gainsboro-400 hover:text-gainsboro-200'
                  }`}>
                  {t === 'product' ? 'Product' : 'Bill of Materials'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Product</label>
            <select className={inputClass} value={form.product_id} onChange={(e) => handleProductSelect(e.target.value)}>
              <option value="">Select a product...</option>
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.version})</option>
              ))}
            </select>
          </div>
          {form.eco_type === 'bom' && (
            <div>
              <label className={labelClass}>Bill of Materials</label>
              <select className={inputClass} value={form.bom_id} onChange={(e) => handleBomSelect(e.target.value)}>
                <option value="">Select a BoM...</option>
                {filteredBoms.map((b) => (
                  <option key={b.id} value={b.id}>{b.product_name} {b.name ? `- ${b.name} ` : ''}— {b.version}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className={labelClass}>Effective Date</label>
            <input type="date" className={inputClass} value={form.effective_date} onChange={(e) => setForm({ ...form, effective_date: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Version Update Mode</label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, version_update: true })}
                className={`relative flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                  form.version_update
                    ? 'border-sienna-500 bg-sienna-600/15'
                    : 'border-navy-500 bg-navy-700/50 hover:border-navy-400'
                }`}
              >
                {form.version_update && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sienna-500 flex items-center justify-center text-white text-xs">✓</span>
                )}
                <span className="text-lg mb-1">🆕</span>
                <span className={`text-sm font-semibold ${form.version_update ? 'text-sienna-300' : 'text-gainsboro-300'}`}>Create New Version</span>
                <span className="text-xs text-gainsboro-500 mt-0.5">Bumps v1 → v2, archives old</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, version_update: false })}
                className={`relative flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all ${
                  !form.version_update
                    ? 'border-xanadu-500 bg-xanadu-600/15'
                    : 'border-navy-500 bg-navy-700/50 hover:border-navy-400'
                }`}
              >
                {!form.version_update && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-xanadu-500 flex items-center justify-center text-white text-xs">✓</span>
                )}
                <span className="text-lg mb-1">✏️</span>
                <span className={`text-sm font-semibold ${!form.version_update ? 'text-xanadu-300' : 'text-gainsboro-300'}`}>Patch Existing</span>
                <span className="text-xs text-gainsboro-500 mt-0.5">Edits in-place, same version</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Propose Changes */}
      {step === 2 && (
        <div className="space-y-4">
          {form.eco_type === 'product' ? (
            <ProductChangeForm form={form} product={selectedProduct} onPriceChange={addPriceChange} onAddChange={addComponentChange} inputClass={inputClass} labelClass={labelClass} />
          ) : (
            <BomChangeForm form={form} bom={selectedBom} onAddChange={addComponentChange} onRemoveChange={removeChange} inputClass={inputClass} labelClass={labelClass} />
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="glass-card p-4 space-y-3">
            <div className="flex justify-between"><span className="text-xs text-gainsboro-400">Title</span><span className="text-sm text-gainsboro-200">{form.title}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gainsboro-400">Type</span><Badge status={form.eco_type} /></div>
            <div className="flex justify-between"><span className="text-xs text-gainsboro-400">Version Update</span><span className="text-sm text-gainsboro-200">{form.version_update ? 'Yes' : 'No'}</span></div>
            <div className="flex justify-between"><span className="text-xs text-gainsboro-400">Effective Date</span><span className="text-sm text-gainsboro-200">{form.effective_date || '—'}</span></div>
          </div>
          <h4 className="text-sm font-semibold text-gainsboro-300">Proposed Changes ({form.changes.length})</h4>
          <div className="space-y-2">
            {form.changes.map((c, i) => (
              <div key={i} className="glass-card p-3 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gainsboro-400">{c.change_type}</span>
                  {c.component_name && <span className="text-sm text-gainsboro-200 ml-2">{c.component_name}</span>}
                  {c.field_name && <span className="text-sm text-gainsboro-200 ml-2">{c.field_name}</span>}
                  <span className="text-xs text-gainsboro-500 ml-2">{c.old_value || '—'} → {c.new_value || '—'}</span>
                </div>
              </div>
            ))}
            {form.changes.length === 0 && <p className="text-sm text-gainsboro-500">No changes proposed</p>}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-navy-600">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gainsboro-400 hover:text-gainsboro-200 transition-colors"
        >
          <ChevronLeft size={16} />
          {step > 1 ? 'Back' : 'Cancel'}
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && (!form.title || !form.product_id)}
            className="flex items-center gap-2 px-6 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit ECO'}
          </button>
        )}
      </div>
    </Modal>
  );
}

function ProductChangeForm({ form, product, onPriceChange, onAddChange, inputClass, labelClass }) {
  const [salePrice, setSalePrice] = useState('');
  const [costPrice, setCostPrice] = useState('');

  useEffect(() => {
    if (product) {
      setSalePrice(product.sale_price || '');
      setCostPrice(product.cost_price || '');
    }
  }, [product]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gainsboro-400">Modify product pricing below. Changes will be tracked as part of this ECO.</p>
      <div>
        <label className={labelClass}>Sale Price (Current: ${product?.sale_price || '—'})</label>
        <input type="number" step="0.01" className={inputClass} value={salePrice}
          onChange={(e) => { setSalePrice(e.target.value); onPriceChange('sale_price', product?.sale_price, e.target.value); }} />
      </div>
      <div>
        <label className={labelClass}>Cost Price (Current: ${product?.cost_price || '—'})</label>
        <input type="number" step="0.01" className={inputClass} value={costPrice}
          onChange={(e) => { setCostPrice(e.target.value); onPriceChange('cost_price', product?.cost_price, e.target.value); }} />
      </div>
      
      <div className="pt-4 border-t border-navy-600">
        <h4 className={labelClass}>Lifecycle Action</h4>
        <button
          type="button"
          onClick={() => onAddChange('lifecycle', 'product', product?.status || 'active', 'archived')}
          className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm font-semibold transition-colors mt-1 flex items-center gap-2"
        >
          <Trash2 size={14} /> Archive / Deprecate Product
        </button>
        <p className="text-xs text-gainsboro-500 mt-2">Archiving replaces deletion to preserve historical ECO records.</p>
      </div>
    </div>
  );
}

function BomChangeForm({ form, bom, onAddChange, onRemoveChange, inputClass, labelClass }) {
  const [newComp, setNewComp] = useState({ name: '', qty: '', unit: 'pcs' });

  const currentComponents = bom?.components || [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-gainsboro-400">Modify BoM components. Add, remove, or change quantities.</p>

      {/* Existing components */}
      {currentComponents.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gainsboro-400 mb-2">Current Components</h4>
          <div className="space-y-2">
            {currentComponents.map((comp, i) => {
              const existingChange = form.changes.find(
                (c) => c.component_name === comp.component_name && c.change_type === 'component_qty'
              );
              return (
                <div key={i} className="glass-card p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gainsboro-200">{comp.component_name}</span>
                    <span className="text-xs text-gainsboro-500">{comp.quantity} {comp.unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number" step="0.001" placeholder="New qty" className="w-24 bg-navy-700 border border-navy-500 text-gainsboro-100 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-sienna-500"
                      value={existingChange?.new_value || ''}
                      onChange={(e) => {
                        const idx = form.changes.findIndex((c) => c.component_name === comp.component_name && c.change_type === 'component_qty');
                        if (idx >= 0) onRemoveChange(idx);
                        if (e.target.value) onAddChange('component_qty', comp.component_name, String(comp.quantity), e.target.value);
                      }}
                    />
                    <button onClick={() => onAddChange('component_remove', comp.component_name, comp.component_name, null)}
                      className="p-1 text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add new component */}
      <div>
        <h4 className="text-xs font-semibold text-gainsboro-400 mb-2">Add Component</h4>
        <div className="flex gap-2">
          <input className={inputClass} placeholder="Component name" value={newComp.name} onChange={(e) => setNewComp({ ...newComp, name: e.target.value })} />
          <input type="number" className="w-24 bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg px-3 py-2.5 text-sm outline-none" placeholder="Qty" value={newComp.qty} onChange={(e) => setNewComp({ ...newComp, qty: e.target.value })} />
          <button
            onClick={() => {
              if (newComp.name && newComp.qty) {
                onAddChange('component_add', newComp.name, null, `${newComp.name} - ${newComp.qty} ${newComp.unit}`);
                setNewComp({ name: '', qty: '', unit: 'pcs' });
              }
            }}
            className="px-3 py-2 bg-sienna-600 hover:bg-sienna-500 text-white rounded-lg transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Current changes */}
      {form.changes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gainsboro-400 mb-2">Pending Changes ({form.changes.length})</h4>
          <div className="space-y-1">
            {form.changes.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-navy-700/50 rounded px-3 py-1.5">
                <span className="text-xs text-gainsboro-300">
                  <Badge status={c.change_type.replace('component_', '').replace('_', ' ')} className="mr-2" />
                  {c.component_name} {c.old_value && c.new_value ? `${c.old_value} → ${c.new_value}` : ''}
                </span>
                <button onClick={() => onRemoveChange(i)} className="text-gainsboro-500 hover:text-red-400"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-navy-600">
        <h4 className={labelClass}>Lifecycle Action</h4>
        <button
          type="button"
          onClick={() => onAddChange('lifecycle', 'bom', bom?.status || 'active', 'archived')}
          className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-sm font-semibold transition-colors mt-1 flex items-center gap-2"
        >
          <Trash2 size={14} /> Archive / Deprecate BoM
        </button>
        <p className="text-xs text-gainsboro-500 mt-2">Archiving replaces deletion to preserve historical ECO records.</p>
      </div>
    </div>
  );
}
