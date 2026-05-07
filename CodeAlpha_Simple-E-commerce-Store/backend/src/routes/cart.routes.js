import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCouponToCart,
  removeCouponFromCart
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.route('/coupon')
  .post(applyCouponToCart)
  .delete(removeCouponFromCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeFromCart);

export default router;