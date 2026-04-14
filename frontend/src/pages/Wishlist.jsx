import React from 'react';
import { useSelector } from 'react-redux';
import ProductCard from '../components/ProductCard.jsx';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { user, loading } = useSelector(state => state.auth);

  const products = user?.wishlist || [];

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.75rem' }}>
        My Wishlist ({products.length})
      </h1>

      {products.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem' }}>♡</div>
          <h3>Your wishlist is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Save products you love by clicking the heart icon.
          </p>
          <Link to="/catalog" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-4">
          {products.map(p => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;