import { create } from 'zustand';
import api from '../api/axios';

const useEcoStore = create((set, get) => ({
  ecos: [],
  ecosMeta: null,
  products: [],
  productsMeta: null,
  boms: [],
  bomsMeta: null,
  stages: [],
  stats: null,
  recentEcos: [],
  loading: false,

  fetchEcos: async (page = 1, limit = 25, search = '', filters = {}) => {
    set({ loading: true });
    try {
      let url = `/eco?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (filters.eco_type) url += `&eco_type=${encodeURIComponent(filters.eco_type)}`;
      if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
      if (filters.stage) url += `&stage=${encodeURIComponent(filters.stage)}`;
      const { data } = await api.get(url);
      set({ ecos: data.data, ecosMeta: data.meta, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  fetchEcoById: async (id) => {
    const { data } = await api.get(`/eco/${id}`);
    return data;
  },

  fetchEcoSummary: async (id) => {
    const { data } = await api.get(`/eco/${id}/summary`);
    return data;
  },

  createEco: async (ecoData) => {
    const { data } = await api.post('/eco', ecoData);
    set((state) => ({ ecos: [data, ...state.ecos] }));
    return data;
  },

  updateEco: async (id, ecoData) => {
    const { data } = await api.put(`/eco/${id}`, ecoData);
    set((state) => ({
      ecos: state.ecos.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
    return data;
  },

  nextStage: async (id, lastKnownUpdatedAt) => {
    const { data } = await api.post(`/eco/${id}/next-stage`, { lastKnownUpdatedAt });
    set((state) => ({
      ecos: state.ecos.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
    // Re-fetch products and boms in case this ECO application created a new version
    try {
      const [productsRes, bomsRes] = await Promise.all([
        api.get('/products?page=1&limit=25'),
        api.get('/bom?page=1&limit=25'),
      ]);
      set({ 
        products: productsRes.data.data, productsMeta: productsRes.data.meta, 
        boms: bomsRes.data.data, bomsMeta: bomsRes.data.meta 
      });
    } catch (_) { /* non-fatal */ }
    return data;
  },

  approveEco: async (id, lastKnownUpdatedAt) => {
    const { data } = await api.post(`/eco/${id}/approve`, { lastKnownUpdatedAt });
    set((state) => ({
      ecos: state.ecos.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
    // Re-fetch products and boms in case approval triggered an ECO application
    try {
      const [productsRes, bomsRes] = await Promise.all([
        api.get('/products?page=1&limit=25'),
        api.get('/bom?page=1&limit=25'),
      ]);
      set({ 
        products: productsRes.data.data, productsMeta: productsRes.data.meta, 
        boms: bomsRes.data.data, bomsMeta: bomsRes.data.meta 
      });
    } catch (_) { /* non-fatal */ }
    return data;
  },

  patchEcoStage: async (id, stageId, lastKnownUpdatedAt) => {
    const previousEcos = get().ecos;
    const stage = get().stages.find(s => s.id === stageId);
    if (!stage) return;
    
    // Optimistic update
    set(state => ({
      ecos: state.ecos.map(e => e.id === id ? { ...e, stage_id: stageId, stage_name: stage.name } : e)
    }));

    try {
      const { data } = await api.patch(`/eco/${id}/stage`, { stageId, lastKnownUpdatedAt });
      return data;
    } catch (err) {
      // Rollback
      set({ ecos: previousEcos });
      throw err;
    }
  },

  rejectEco: async (id, lastKnownUpdatedAt) => {
    const { data } = await api.post(`/eco/${id}/reject`, { lastKnownUpdatedAt });
    set((state) => ({
      ecos: state.ecos.map((e) => (e.id === id ? { ...e, ...data } : e)),
    }));
    return data;
  },

  fetchProducts: async (page = 1, limit = 25, search = '', filters = {}) => {
    let url = `/products?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
    if (filters.version) url += `&version=${encodeURIComponent(filters.version)}`;
    const { data } = await api.get(url);
    set({ products: data.data, productsMeta: data.meta });
    return data;
  },

  createProduct: async (productData) => {
    const { data } = await api.post('/products', productData);
    set((state) => ({ products: [data, ...state.products] }));
    return data;
  },

  updateProduct: async (id, productData) => {
    const { data } = await api.put(`/products/${id}`, productData);
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? data : p)),
    }));
    return data;
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  fetchBoms: async (page = 1, limit = 25, search = '', filters = {}) => {
    let url = `/bom?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;
    const { data } = await api.get(url);
    set({ boms: data.data, bomsMeta: data.meta });
    return data;
  },

  createBom: async (bomData) => {
    const { data } = await api.post('/bom', bomData);
    set((state) => ({ boms: [data, ...state.boms] }));
    return data;
  },

  updateBom: async (id, bomData) => {
    const { data } = await api.put(`/bom/${id}`, bomData);
    set((state) => ({
      boms: state.boms.map((b) => (b.id === id ? data : b)),
    }));
    return data;
  },

  fetchStages: async () => {
    const { data } = await api.get('/settings/stages');
    set({ stages: data });
    return data;
  },

  fetchDashboardStats: async () => {
    const { data } = await api.get('/reports/dashboard-stats');
    set({ stats: data });
    return data;
  },

  fetchRecentEcos: async () => {
    const { data } = await api.get('/reports/recent-ecos');
    set({ recentEcos: data });
    return data;
  },
}));

export default useEcoStore;
