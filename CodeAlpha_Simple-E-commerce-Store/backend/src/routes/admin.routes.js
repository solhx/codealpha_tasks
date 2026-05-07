import express from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getAllProducts,
  getRevenueReport,
  getSalesReport,
  getInventoryReport,
  getCustomerReport
} from '../controllers/admin.controller.js';
import {
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus
} from '../controllers/coupon.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Orders management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', updateOrderPayment);
router.delete('/orders/:id', deleteOrder);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Products management
router.get('/products', getAllProducts);

// Coupons management
router.get('/coupons', getAllCoupons);
router.get('/coupons/:id', getCouponById);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);
router.put('/coupons/:id/toggle', toggleCouponStatus);

// Reports
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/sales', getSalesReport);
router.get('/reports/inventory', getInventoryReport);
router.get('/reports/customers', getCustomerReport);

export default router;