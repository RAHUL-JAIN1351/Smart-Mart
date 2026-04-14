import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { authApi } from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

const TIER_COLORS = { Bronze: '#cd7f32', Silver: '#9ca3af', Gold: '#f59e0b', Platinum: '#60a5fa' };
const TIER_NEXT = { Bronze: 500, Silver: 2000, Gold: 5000, Platinum: 5000 };

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [form, setForm] = useState({ name: user?.name || '', address: user?.address || {} });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); } finally { setSaving(false); }
  };

  const pts = user?.loyaltyPoints || 0;
  const tier = user?.loyaltyTier || 'Bronze';
  const nextTier = TIER_NEXT[tier];
  const progress = Math.min((pts / nextTier) * 100, 100);

  return (
    <div className="container profile-layout">
      <div className="profile-sidebar">
        <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <h2>{user?.name}</h2>
        <p className="text-muted">{user?.email}</p>
        <div className="tier-badge" style={{ background: TIER_COLORS[tier] }}>
          {tier} Member
        </div>
        <div className="loyalty-card">
          <div className="loyalty-header">
            <span>Loyalty Points</span>
            <span className="points">{pts.toLocaleString()}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%`, background: TIER_COLORS[tier] }} />
          </div>
          <p className="tier-info">
            {tier !== 'Platinum'
              ? `${(nextTier - pts).toLocaleString()} pts to ${Object.keys(TIER_NEXT).find((_, i, a) => a[i - 1] === tier) || 'next tier'}`
              : 'Max tier achieved!'}
          </p>
        </div>
      </div>

      <div>
        <div className="profile-section">
          <h3>Personal Information</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email (read-only)</label>
              <input className="form-input" value={user?.email} readOnly style={{ background: '#f3f4f6' }} />
            </div>
            <h4 style={{ margin: '1.25rem 0 0.75rem' }}>Shipping Address</h4>
            <div className="form-group">
              <label className="form-label">Street</label>
              <input className="form-input" value={form.address?.street || ''} onChange={e => setForm({...form, address: {...form.address, street: e.target.value}})} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.address?.city || ''} onChange={e => setForm({...form, address: {...form.address, city: e.target.value}})} />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" value={form.address?.country || ''} onChange={e => setForm({...form, address: {...form.address, country: e.target.value}})} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
