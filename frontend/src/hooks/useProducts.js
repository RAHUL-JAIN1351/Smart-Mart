import { useState, useEffect, useCallback } from 'react';
import { productApi } from '../services/api';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchProducts = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await productApi.getAll(params);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(initialParams); }, []);

  return { products, loading, error, total, pages, fetchProducts };
};

export const useTrending = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    productApi.getTrending().then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { products, loading };
};

export const useFlashSales = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    productApi.getFlashSales().then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);
  return { products, loading };
};
