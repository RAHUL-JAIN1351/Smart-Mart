import React, { useState , useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { selectCartCount } from '../store/cartSlice';
import { toast } from 'react-toastify';
import { productApi } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const cartCount = useSelector(selectCartCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Logged out');
    navigate('/');
  };

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await productApi.getAll({
          search,
          limit: 5
        });

        setSuggestions(res.data.products);
      } catch (err) {
          console.error(err);
        }
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <>
      <div className="promo-bar">
        Members get 2x Loyalty Points on all purchases this week.&nbsp;
        <Link to="/register">Join SmartMart+</Link>
      </div>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🛍</span>
            <span>SmartMart<span className="brand-plus">+</span></span>
          </Link>

          <div className="navbar-links">
            <Link to="/catalog">Catalog</Link>
            <Link to="/catalog?category=Electronics">Electronics</Link>
            <Link to="/catalog?category=Fashion">Fashion</Link>
            <Link to="/catalog?sort=popular">Trending</Link>
          </div>


          <div className="navbar-search">
            <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
            />
            {suggestions.length > 0 && (
                <div className="search-dropdown">
                    {suggestions.map(p => (
                    <div
                        key={p._id}
                        className="search-item"
                        onClick={() => {
                            navigate(`/products/${p._id}`);
                            setSearch('');
                            setSuggestions([]);
                        }}
                    >
                {p.name}
              </div>
                ))}
            </div>
            )}
          </div>

          <div className="navbar-actions">
            <Link to="/cart" className="cart-btn">
              🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            {user ? (
              <div className="user-menu">
                <button className="user-btn" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.name.split(' ')[0]} ▾
                </button>
                {menuOpen && (
                  <div className="dropdown">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                    <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                    <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
                    <hr />
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Join Now</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
