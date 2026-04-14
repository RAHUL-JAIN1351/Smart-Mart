import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <div className="footer-logo">🛍 SmartMart<span>+</span></div>
        <p>The premium destination for curated products and rewarding experiences.</p>
      </div>
      <div className="footer-col">
        <h4>Shop</h4>
        <Link to="/catalog">All Products</Link>
        <Link to="/catalog?sort=popular">Trending</Link>
        <Link to="/catalog?category=Electronics">Electronics</Link>
        <Link to="/catalog?category=Fashion">Fashion</Link>
      </div>
      <div className="footer-col">
        <h4>Account</h4>
        <Link to="/profile">Profile</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/wishlist">Wishlist</Link>
      </div>
      <div className="footer-col">
        <h4>Support</h4>
        <a href="#">Help Center</a>
        <a href="#">Returns</a>
        <a href="#">Shipping Info</a>
        <a href="#">Contact Us</a>
      </div>
    </div>
    <div className="footer-bottom container">
      <p>© 2026 SmartMart+. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
