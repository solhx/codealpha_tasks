import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  uploadImages
} from '../controllers/product.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured/list', getFeaturedProducts);
router.get('/categories/list', getCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProduct);

// Protected routes
router.post('/:id/reviews', protect, addReview);

// Admin routes
router.post('/', protect, adminOnly, createProduct);
router.post('/upload', protect, adminOnly, upload.array('images', 5), uploadImages);
router.put('/:id', protect, adminOnly, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;