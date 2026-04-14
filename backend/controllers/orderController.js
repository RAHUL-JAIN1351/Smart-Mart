// controllers/orderController.js

import "../config/env.js"

import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    })
  : null;

// CREATE RAZORPAY ORDER
export const createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ error: "Razorpay not configured" });
    }

    const options = {
      amount: req.body.amount,
      currency: "INR"
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Razorpay order failed" });
  }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // SAVE ORDER AFTER SUCCESS
    const order = await Order.create({
  user: req.user._id, 
  ...orderData,
  paymentMethod: "Razorpay",
  isPaid: true,
  status: "confirmed"
});

    res.json({ success: true, order });

  } catch (err) {
    console.error("VERIFY ERROR:", err); 
    res.status(500).json({ error: "Verification failed" });
  }
};


// CREATE ORDER
export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ error: 'No order items' });

    const loyaltyEarned = Math.floor(totalPrice);

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      loyaltyPointsEarned: loyaltyEarned
    });

    // Update stock and sold count for each product
    await Promise.all(
      items.map(item =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.qty, sold: item.qty }
        })
      )
    );

    // Update user's loyalty points
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: loyaltyEarned } });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// GET ORDERS OF LOGGED IN USER
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments({ user: req.user._id });

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('items.product', 'name image');

    res.json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// GET ORDER BY ID
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name image');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PAY ORDER
export const payOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body;
    order.status = 'confirmed';

    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// CANCEL ORDER
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Cannot cancel this order' });

    order.status = 'cancelled';
    await order.save();

    // Restore stock
    await Promise.all(
      order.items.map(item =>
        Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, sold: -item.qty } })
      )
    );

    res.json(order);
  } catch (err) {
    next(err);
  }
};

// GET ALL ORDERS (ADMIN)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// UPDATE ORDER STATUS (ADMIN)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    next(err);
  }
};