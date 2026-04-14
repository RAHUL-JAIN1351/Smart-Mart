import { Router } from 'express';
import {
  getProducts,
  getTrending,
  getFlashSales,
  getProductById,
  getCategories,
  addReview,
  getRecommendations,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.get('/', getProducts);
router.get('/trending', getTrending);
router.get('/flash-sales', getFlashSales);
router.get('/categories', getCategories);
router.get('/recommendations', getRecommendations);
router.get('/:id', getProductById);

router.post('/:id/reviews', protect, addReview);
router.post('/', protect, adminOnly, createProduct);

router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;