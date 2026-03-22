import { useEffect, useCallback, useState } from 'react';
import useEcoStore from '../store/ecoStore';
import toast from 'react-hot-toast';

export default function useProducts() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', version: '' });
  const { products, productsMeta, fetchProducts, createProduct, updateProduct, deleteProduct } = useEcoStore();

  const loadProducts = useCallback(() => {
    fetchProducts(page, 25, search, filters).catch(() => toast.error('Failed to load products'));
  }, [page, search, filters, fetchProducts]);

  useEffect(() => {
    loadProducts();
    // Auto-refresh every 30 seconds so version changes from ECOs appear without manual reload
    const interval = setInterval(loadProducts, 30000);
    return () => clearInterval(interval);
  }, [loadProducts]);

  const handleCreate = async (data) => {
    try {
      const product = await createProduct(data);
      toast.success('Product created');
      return product;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
      throw err;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const product = await updateProduct(id, data);
      toast.success('Product updated');
      return product;
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update product');
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
      throw err;
    }
  };

  return { products, productsMeta, page, setPage, search, setSearch, filters, setFilters, handleCreate, handleUpdate, handleDelete, refresh: loadProducts };
}

