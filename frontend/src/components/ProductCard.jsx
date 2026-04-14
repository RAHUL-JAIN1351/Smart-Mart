import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateWishlist } from '../store/authSlice';
import { authApi } from '../services/api';
import useCart from '../hooks/useCart';
import Stars from './Stars.jsx';
import './ProductCard.css';

const ProductCard = ({ product, loading = false }) => {
  const dispatch = useDispatch();
  const { add } = useCart();

  const { user } = useSelector(state => state.auth);

const isWishlisted = user?.wishlist?.some(item => {
  const id = typeof item === 'object' ? item._id : item;
  return id?.toString() === product?._id?.toString();
});

  if (loading) return (
    <div className="product-card skeleton-card">
      <div className="skeleton product-card-img" />
      <div className="product-card-body">
        <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem', width: '80%' }} />
        <div className="skeleton" style={{ height: '0.8rem', marginBottom: '0.75rem', width: '60%' }} />
        <div className="skeleton" style={{ height: '1.2rem', width: '40%' }} />
      </div>
    </div>
  );

  // sync with backend
  const handleWishlist = async (e) => {
  e.preventDefault();

  console.log("USER:", user);
  console.log("WISHLIST:", user?.wishlist);

  if (!user) return;

  try {
    const res = await authApi.toggleWishlist(product._id);

    console.log("API:", res.data); // debug

    // FORCE update
    dispatch(updateWishlist([...res.data.wishlist]));
  } catch (err) {
    console.error(err);
  }
};

  const displayPrice =
    product.isFlashSale && product.flashSalePrice
      ? product.flashSalePrice
      : product.price;

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-img-wrap">
        <img src={product.image} alt={product.name} loading="lazy" />

        {product.isFlashSale && (
          <span className="badge badge-danger card-badge">Flash Sale</span>
        )}

        {product.isTrending && !product.isFlashSale && (
          <span className="badge badge-accent card-badge">Trending</span>
        )}

        {/* FIXED HEART */}
        {user && (
          <button
  className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
  onClick={handleWishlist}
>
  <svg
    className="heart-icon"
    viewBox="0 0 24 24"
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 
             2 6 4 4 6.5 4 
             8.04 4 9.54 4.81 10.4 6.09 
             11.26 4.81 12.76 4 14.3 4 
             16.8 4 18.8 6 18.8 8.5 
             18.8 12.28 15.4 15.36 10.25 20.04 
             L12 21.35z"/>
  </svg>
</button>
        )}
      </Link>

      <div className="product-card-body">
        <span className="product-category">{product.category}</span>

        <Link to={`/products/${product._id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <Stars rating={product.rating} count={product.numReviews} />

        <div className="product-price-row">
          <div>
            <span className="product-price">
              ${displayPrice.toFixed(2)}
            </span>

            {product.isFlashSale && product.flashSalePrice && (
              <span className="product-price-original">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => add(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;