import React from 'react';

const Stars = ({ rating = 0, count }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="stars">
      {stars.map(s => (
        <span key={s} className={`star ${s <= Math.round(rating) ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
      {count !== undefined && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>({count})</span>}
    </div>
  );
};

export default Stars;
