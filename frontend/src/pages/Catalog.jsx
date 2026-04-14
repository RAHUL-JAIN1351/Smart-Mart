import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import ProductCard from '../components/ProductCard.jsx';
import './Catalog.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' }
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');
  const inStock = searchParams.get('inStock') === 'true';
  const [priceRange, setPriceRange] = useState([0, 1000]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort };
      if (category) params.category = category;
      if (search) params.search = search;
      if (inStock) params.inStock = true;
      params.minPrice = priceRange[0];
      params.maxPrice = priceRange[1];
      const res = await productApi.getAll(params);
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [category, search, sort, page, inStock, priceRange]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { productApi.getCategories().then(r => setCategories(r.data)).catch(() => {}); }, []);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="container catalog-layout">
      <aside className="catalog-sidebar">
        <h3>Filters</h3>
        <div className="filter-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={category} onChange={e => setParam('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label className="form-label">Price Range</label>
          <div className="price-range-labels">
            <span>${priceRange[0]}</span><span>${priceRange[1]}+</span>
          </div>
          <input type="range" min="0" max="1000" value={priceRange[1]}
            onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="price-slider" />
        </div>
        <div className="filter-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={inStock} onChange={e => setParam('inStock', e.target.checked ? 'true' : '')} />
            In Stock Only
          </label>
        </div>
        <button className="btn btn-outline btn-full" onClick={() => setSearchParams({})}>Clear Filters</button>
      </aside>

      <div className="catalog-main">
        <div className="catalog-header">
          <h1>{category || 'All Products'} {search && `— "${search}"`}</h1>
          <div className="catalog-controls">
            <span className="text-muted">{total} products</span>
            <select className="form-input" style={{ width: 'auto' }} value={sort} onChange={e => setParam('sort', e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {!loading && products.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem' }}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-4">
            {(loading ? Array(12).fill(null) : products).map((p, i) => (
              <ProductCard key={p?._id || i} product={p} loading={!p} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${page === n ? 'active' : ''}`}
                onClick={() => { const p = new URLSearchParams(searchParams); p.set('page', n); setSearchParams(p); }}>
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
