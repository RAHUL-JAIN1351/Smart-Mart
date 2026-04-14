import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useCart from '../hooks/useCart';
import './Cart.css';

const Cart = () => {
  const { items, total, remove, update, clear } = useCart();
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  if (items.length === 0) return (
    <div className="container empty-cart">
      <div className="empty-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Add some products to get started!</p>
      <Link to="/catalog" className="btn btn-primary btn-lg">Browse Products</Link>
    </div>
  );

  const shipping = total > 99 ? 0 : 9.99;
  const tax = total * 0.08;
  const grandTotal = total + shipping + tax;

  return (
    <div className="container cart-layout">
      <div>
        <div className="cart-header">
          <h1>Shopping Cart ({items.length})</h1>
          <button className="btn btn-outline btn-sm" onClick={clear}>Clear Cart</button>
        </div>
        {items.map(item => (
          <div key={item._id} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="cart-item-info">
              <Link to={`/products/${item._id}`}><h3>{item.name}</h3></Link>
              <span className="text-muted">{item.category}</span>
            </div>
            <div className="cart-item-qty">
              <button onClick={() => update(item._id, Math.max(1, item.qty - 1))}>−</button>
              <span>{item.qty}</span>
              <button onClick={() => update(item._id, Math.min(item.stock, item.qty + 1))}>+</button>
            </div>
            <div className="cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
            <button className="remove-btn" onClick={() => remove(item._id)}>✕</button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h2>Order Summary</h2>
        <div className="summary-row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
        <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
        <div className="summary-row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
        <hr />
        <div className="summary-row total"><span>Total</span><span>${grandTotal.toFixed(2)}</span></div>
        {shipping > 0 && <p className="free-shipping-note">Add ${(99 - total).toFixed(2)} more for free shipping!</p>}
        <button className="btn btn-primary btn-lg btn-full" onClick={() => user ? navigate('/checkout') : navigate('/login')}>
          {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
        </button>
        <Link to="/catalog" className="btn btn-outline btn-full" style={{ marginTop: '0.75rem' }}>Continue Shopping</Link>
      </div>
    </div>
  );
};

export default Cart;
