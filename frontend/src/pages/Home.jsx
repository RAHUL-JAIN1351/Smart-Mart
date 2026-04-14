import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrending, useFlashSales } from '../hooks/useProducts';
import { productApi } from '../services/api';
import ProductCard from '../components/ProductCard.jsx';
import './Home.css';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', color: '#EEF2FF' },
  { name: 'Fashion', icon: '👗', color: '#FFF7ED' },
  { name: 'Home', icon: '🏡', color: '#F0FDF4' },
  { name: 'Sports', icon: '⚽', color: '#FFF1F2' }
];

const Home = () => {

  const { products: trending = [], loading: tLoading } = useTrending();
  const { products: flashSales = [], loading: fLoading } = useFlashSales();

  const navigate = useNavigate();

  // Infinite Scroll State
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchProducts = async () => {
    try {

      const res = await productApi.getAll({ page, limit: 12 });

      setProducts(prev => [...prev, ...res.data.products]);

      if (page >= res.data.pages) {
        setHasMore(false);
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      {
        rootMargin: "200px",
        threshold: 0
      }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();

  }, [hasMore]);

  return (
    <div>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="container hero-inner">

          <div className="hero-text">
            <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
              Premium Collection
            </span>

            <h1>
              Curated Quality,<br />
              <span>Delivered Fast.</span>
            </h1>

            <p>
              Discover our new arrivals and trending products tailored just for you.
            </p>

            <div className="hero-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/catalog')}
              >
                Explore Catalog
              </button>

              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate('/catalog?isFlashSale=true')}
              >
                Flash Sales
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-inner">
              <div className="hero-card-icon">🛍</div>
              <div className="hero-card-title">SmartMart+</div>
              <div className="hero-card-sub">The future of retail</div>
            </div>
          </div>

        </div>
      </section>


      {/* FLASH SALES */}
      {Array.isArray(flashSales) && flashSales.length > 0 && (
        <section className="section flash-section">
          <div className="container">

            <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 className="section-title">⚡ Flash Sales</h2>
                <p className="section-subtitle">
                  Limited time deals — grab them fast!
                </p>
              </div>

              <Link to="/catalog?isFlashSale=true" className="view-all">
                View All →
              </Link>
            </div>

            <div className="grid grid-4">
              {(fLoading ? Array(4).fill(null) : flashSales.slice(0, 4)).map((p, i) => (
                <ProductCard key={p?._id || i} product={p} loading={!p} />
              ))}
            </div>

          </div>
        </section>
      )}


      {/* TRENDING */}
      <section className="section">
        <div className="container">

          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 className="section-title">Trending Now</h2>
              <p className="section-subtitle">
                The most popular items this week.
              </p>
            </div>

            <Link to="/catalog?sort=popular" className="view-all">
              View All →
            </Link>
          </div>

          <div className="grid grid-4">
            {(tLoading ? Array(8).fill(null) : trending).map((p, i) => (
              <ProductCard key={p?._id || i} product={p} loading={!p} />
            ))}
          </div>

        </div>
      </section>


      {/* CATEGORIES */}
      <section className="section categories-section">
        <div className="container">

          <h2
            className="section-title"
            style={{ textAlign: 'center', marginBottom: '1.75rem' }}
          >
            Shop by Category
          </h2>

          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.name}
                to={`/catalog?category=${cat.name}`}
                className="category-card"
                style={{ background: cat.color }}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>

        </div>
      </section>


      {/* DISCOVER PRODUCTS (INFINITE SCROLL) */}
      <section className="section">
        <div className="container">

          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 className="section-title">Discover Products</h2>
              <p className="section-subtitle">
                Browse our entire collection.
              </p>
            </div>

            <Link to="/catalog" className="view-all">
              Full Catalog →
            </Link>
          </div>

          <div className="grid grid-4">

  {products.map(product => (
    <div className="product-fade">
      <ProductCard key={product._id} product={product} />
    </div>
  ))}

  {hasMore &&
    Array(4).fill(null).map((_, i) => (
      <ProductCard key={`skeleton-${i}`} loading />
    ))
  }

</div>

          {hasMore && (
  <div
    ref={loaderRef}
    className="infinite-loader"
  >
    <div className="spinner"></div>
    <p>Loading more products</p>
  </div>
)}

        </div>
      </section>


      {/* LOYALTY BANNER */}
      <section className="loyalty-banner">
        <div className="container" style={{ textAlign: 'center' }}>

          <div className="loyalty-icon">👑</div>

          <h2>Join SmartMart+ Rewards</h2>

          <p>
            Earn points on every purchase, unlock exclusive flash sales,
            and get free shipping.
          </p>

          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link to="/register" className="btn btn-accent btn-lg">
              Join for Free
            </Link>

            <Link to="/login" className="btn btn-outline-white btn-lg">
              Sign In
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;