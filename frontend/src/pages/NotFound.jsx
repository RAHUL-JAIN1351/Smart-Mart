import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
    <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>404</div>
    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Page Not Found</h1>
    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
  </div>
);

export default NotFound;
