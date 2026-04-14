// controllers/authController.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

import admin from "../config/firebaseAdmin.js";

export const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(token);

    const { name, email } = decodedToken;

    console.log("FIREBASE USER:", decodedToken); // DEBUG

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || "Google User",
        email,
        password: Math.random().toString(36).slice(-8)
      });
    }

    const jwtToken = signToken(user._id);

    res.json({
      token: jwtToken,
      user
    });

  } catch (err) {
    console.error("FIREBASE AUTH ERROR:", err);
    res.status(401).json({ error: "Google authentication failed" });
  }
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });


// REGISTER
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      }
    });
  } catch (err) {
    next(err);
  }
};


// LOGIN
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        loyaltyPoints: user.loyaltyPoints,
        loyaltyTier: user.loyaltyTier
      }
    });
  } catch (err) {
    next(err);
  }
};


// GET PROFILE
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price image');
    res.json(user);
  } catch (err) {
    next(err);
  }
};


// UPDATE PROFILE
export const updateProfile = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, address },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};


// TOGGLE WISHLIST
export const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    // const idx = user.wishlist.indexOf(productId);
    const idx = user.wishlist.findIndex(
      id => id.toString() === productId
    );
    if (idx > -1) user.wishlist.splice(idx, 1);
    else user.wishlist.push(productId);

    await user.save();

    await user.populate('wishlist', 'name price image');

    res.json({ wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};
