import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi } from '../services/api';
import './OrderDetail.css';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(id).then(r => setOrder(r.data)).catch(() => navigate('/orders')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <button className="back-btn" onClick={() => navigate('/orders')}>← My Orders</button>
      <div className="order-detail-header">
        <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
      </div>

      {order.status !== 'cancelled' && (
        <div className="progress-tracker">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className={`progress-step ${i <= currentStep ? 'done' : ''}`}>
              <div className="progress-dot">{i < currentStep ? '✓' : i + 1}</div>
              <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="order-detail-grid">
        <div>
          <div className="detail-card">
            <h3>Items Ordered</h3>
            {order.items.map(item => (
              <div key={item._id} className="order-item-row">
                <img src={item.image || item.product?.image} alt={item.name} />
                <span className="flex-1 font-600">{item.name}</span>
                <span className="text-muted">×{item.qty}</span>
                <span className="font-700">${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="detail-card">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
        </div>
        <div>
          <div className="detail-card">
            <h3>Order Summary</h3>
            <div className="summary-row"><span>Items</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>${order.shippingPrice?.toFixed(2)}</span></div>
            <div className="summary-row"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
            <hr />
            <div className="summary-row total"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
            <div className="summary-row"><span>Payment</span><span>{order.paymentMethod}</span></div>
            {order.loyaltyPointsEarned > 0 && (
              <div className="loyalty-earned-detail">+{order.loyaltyPointsEarned} Loyalty Points Earned!</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
