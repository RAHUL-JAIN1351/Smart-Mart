import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Async wrapper helper (can be reused in controllers too)
const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

// Protect routes - verify JWT token
export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password');

  if (!req.user) {
    return res.status(401).json({ error: 'Not authorized, user not found' });
  }

  next();
});

// Restrict access to admin only
export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
