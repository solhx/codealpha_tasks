import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderToPaid,
  cancelOrder
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All order routes require authentication
router.use(protect);

router.route('/')
  .get(getMyOrders)
  .post(createOrder);

router.get('/:id', getOrder);
router.put('/:id/pay', updateOrderToPaid);
router.put('/:id/cancel', cancelOrder);

export default router;