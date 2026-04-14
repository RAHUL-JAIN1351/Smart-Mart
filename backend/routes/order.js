import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  payOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/auth.js';

import {
  createRazorpayOrder,
  verifyPayment
} from "../controllers/orderController.js";

const router = Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, payOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

router.post("/razorpay", createRazorpayOrder);
router.post("/verify", protect, verifyPayment);

export default router;