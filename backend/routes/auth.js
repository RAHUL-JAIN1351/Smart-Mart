import { Router } from 'express';
import { register, login, getProfile, updateProfile, toggleWishlist } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

import { googleAuth } from '../controllers/authController.js';

const router = Router();

router.post('/google', googleAuth);

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/wishlist/:productId', protect, toggleWishlist);

export default router;