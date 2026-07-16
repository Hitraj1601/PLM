import { useState } from 'react';
import { Plus, Lock, Edit2, Trash2, Package, Search, Filter } from 'lucide-react';
import useProducts from '../hooks/useProducts';
import useAuthStore from '../store/authStore';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';

export default function ProductsPage() {
  const { products, productsMeta, page, setPage, search, setSearch, filters, setFilters, handleCreate, handleUpdate, handleDelete } = useProducts();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', version: 'v1', sale_price: '', cost_price: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);

  const canEdit = user?.role === 'engineering' || user?.role === 'admin';
  const canDelete = user?.role === 'admin';

  const openCreate = () => {
    setEditProduct(null);
    setForm({ name: '', version: 'v1', sale_price: '', cost_price: '' });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({ name: product.name, version: product.version, sale_price: product.sale_price, cost_price: product.cost_price });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      if (editProduct) {
        await handleUpdate(editProduct.id, form);
      } else {
        await handleCreate(form);
      }
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (v, row) => (
      <div className={`flex items-center gap-2 ${row.status === 'archived' ? 'opacity-50' : ''}`}>
        {row.status === 'archived' && <Lock size={14} className="text-gainsboro-500" />}
        <span className="font-medium text-gainsboro-200">{v}</span>
      </div>
    )},
    { key: 'version', label: 'Version', render: (v) => <span className="text-sienna-400 font-mono text-xs">{v}</span> },
    { key: 'sale_price', label: 'Sale Price', render: (v) => v ? `$${parseFloat(v).toFixed(2)}` : '—' },
    { key: 'cost_price', label: 'Cost Price', render: (v) => v ? `$${parseFloat(v).toFixed(2)}` : '—' },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> },
    { key: 'status', label: 'Status', render: (v) => <Badge status={v} /> }
  ];

  const inputClass = 'w-full bg-navy-700 border border-navy-500 text-gainsboro-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-sienna-500 focus:border-transparent outline-none';
  const filterSelectClass = 'bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent px-3 py-2';

  // Collect distinct versions from current products for the version filter dropdown
  const distinctVersions = [...new Set(products.map(p => p.version).filter(Boolean))].sort();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gainsboro-100">Products</h1>
          <p className="text-sm text-gainsboro-400 mt-1">{productsMeta?.total || products.length} products total</p>
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
            <select
              value={filters.version}
              onChange={(e) => { setFilters({ ...filters, version: e.target.value }); setPage(1); }}
              className={filterSelectClass}
            >
              <option value="">All Versions</option>
              {distinctVersions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {/* Search input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gainsboro-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 bg-navy-800 border border-navy-600 rounded-lg text-sm text-gainsboro-200 placeholder-gainsboro-500 outline-none focus:ring-2 focus:ring-sienna-500 focus:border-transparent w-56"
            />
          </div>
          {canEdit && (
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors">
              <Plus size={16} /> New Product
            </button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" message="Create your first product to get started" action={canEdit ? openCreate : undefined} actionLabel="New Product" />
      ) : (
        <>
          <Table columns={columns} data={products} onRowClick={(row) => setSelectedProduct(row)} />
          <Pagination meta={productsMeta} onPageChange={setPage} />
        </>
      )}

      {/* Version History Panel */}
      {selectedProduct && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gainsboro-200">Version History: {selectedProduct.name}</h3>
            <button onClick={() => setSelectedProduct(null)} className="text-gainsboro-400 hover:text-gainsboro-200 text-sm">Close</button>
          </div>
          <div className="space-y-2">
            {products.filter((p) => p.name === selectedProduct.name).map((p) => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${p.status === 'archived' ? 'bg-navy-800/50 opacity-60' : 'bg-navy-700'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-sienna-400 font-mono text-xs">{p.version}</span>
                  <Badge status={p.status} />
                </div>
                <span className="text-xs text-gainsboro-500">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editProduct ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          {!editProduct && (
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Version</label>
              <input className={inputClass} value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Sale Price</label>
              <input type="number" step="0.01" className={inputClass} value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gainsboro-400 mb-1.5">Cost Price</label>
              <input type="number" step="0.01" className={inputClass} value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-sienna-600 hover:bg-sienna-500 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50">
              {submitting ? (editProduct ? 'Updating...' : 'Creating...') : (editProduct ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
