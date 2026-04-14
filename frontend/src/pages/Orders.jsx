import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../services/api';
import './Orders.css';

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', processing: '#8b5cf6',
  shipped: '#0ea5e9', delivered: '#10b981', cancelled: '#ef4444'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders().then(r => setOrders(r.data.orders)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.75rem' }}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>📦</div>
          <h3>No orders yet</h3>
          <p>When you place orders, they will appear here.</p>
          <Link to="/catalog" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <span className="order-status" style={{ background: STATUS_COLORS[order.status] }}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="order-items">
              {order.items?.slice(0, 3).map(item => (
                <img key={item._id} src={item.image || item.product?.image} alt={item.name} className="order-thumb" />
              ))}
              {order.items?.length > 3 && <span className="more-items">+{order.items.length - 3}</span>}
            </div>
            <div className="order-card-footer">
              <span className="order-total">${order.totalPrice?.toFixed(2)}</span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="loyalty-earned">+{order.loyaltyPointsEarned} pts</span>
                <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">View Details</Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
