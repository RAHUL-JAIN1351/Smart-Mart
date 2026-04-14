import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { productApi } from '../services/api';
import useCart from '../hooks/useCart';
import Stars from '../components/Stars.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const { user } = useSelector(state => state.auth);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    productApi.getById(id).then(r => {
      setProduct(r.data);
      productApi.getRecommendations({ category: r.data.category, exclude: id })
        .then(rel => setRelated(rel.data)).catch(() => {});
    }).catch(() => navigate('/catalog')).finally(() => setLoading(false));
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to review');
    setSubmitting(true);
    try {
      await productApi.addReview(id, { rating: reviewRating, comment: reviewText });
      toast.success('Review submitted!');
      const res = await productApi.getById(id);
      setProduct(res.data);
      setReviewText('');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!product) return null;

  const displayPrice = product.isFlashSale && product.flashSalePrice ? product.flashSalePrice : product.price;
  const discount = product.isFlashSale && product.flashSalePrice
    ? Math.round((1 - product.flashSalePrice / product.price) * 100) : null;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="product-detail">
        <div className="product-detail-img">
          <img src={product.image} alt={product.name} />
          {product.isFlashSale && <span className="badge badge-danger detail-badge">⚡ Flash Sale — {discount}% OFF</span>}
        </div>

        <div className="product-detail-info">
          <span className="product-category">{product.category}</span>
          <h1>{product.name}</h1>
          <Stars rating={product.rating} count={product.numReviews} />
          <p className="product-desc">{product.description}</p>

          <div className="price-block">
            <span className="detail-price">${displayPrice.toFixed(2)}</span>
            {discount && <span className="detail-price-original">${product.price.toFixed(2)}</span>}
          </div>

          <div className="stock-info">
            {product.stock > 0
              ? <span className="text-success">✓ In Stock ({product.stock} left)</span>
              : <span className="text-danger">✗ Out of Stock</span>}
          </div>

          <div className="qty-row">
            <label>Qty:</label>
            <div className="qty-controls">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary btn-lg" disabled={product.stock === 0} onClick={() => { add(product, qty); }}>
              Add to Cart
            </button>
          </div>

          <div className="product-tags">
            {product.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Customer Reviews</h2>
        {product.reviews?.length === 0 && <p className="text-muted">No reviews yet. Be the first!</p>}
        {product.reviews?.map(r => (
          <div key={r._id} className="review-card">
            <div className="review-header">
              <strong>{r.name}</strong>
              <Stars rating={r.rating} />
              <span className="text-muted review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <p>{r.comment}</p>
          </div>
        ))}

        {user && (
          <form className="review-form" onSubmit={handleReview}>
            <h3>Write a Review</h3>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="star-select">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" className={`star-btn ${s <= reviewRating ? 'active' : ''}`}
                    onClick={() => setReviewRating(s)}>★</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment</label>
              <textarea className="form-input" rows={3} required value={reviewText}
                onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..." />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>

      {related.length > 0 && (
        <div className="section">
          <h2 className="section-title">You Might Also Like</h2>
          <div className="grid grid-4">
            {related.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
