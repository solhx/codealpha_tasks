import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('token') 
      : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        response: {
          data: {
            message: 'Network error. Please check your connection.'
          }
        }
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        
        // Don't redirect if already on auth pages
        if (!currentPath.startsWith('/login') && 
            !currentPath.startsWith('/register') &&
            !currentPath.startsWith('/forgot-password') &&
            !currentPath.startsWith('/reset-password')) {
          localStorage.removeItem('token');
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH API
// ============================================
export const authApi = {
  // Register new user
  register: (data: { 
    name: string; 
    email: string; 
    password: string; 
    phone?: string 
  }) => api.post('/auth/register', data),

  // Login user
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  // Logout user
  logout: () => api.post('/auth/logout'),

  // Get current user profile
  getMe: () => api.get('/auth/me'),

  // Update user profile
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
  }) => api.put('/auth/profile', data),

  // Update password
  updatePassword: (data: { 
    currentPassword: string; 
    newPassword: string 
  }) => api.put('/auth/password', data),

  // Forgot password - send reset email
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  // Reset password with token
  resetPassword: (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),

  // Verify email
  verifyEmail: (token: string) =>
    api.post(`/auth/verify-email/${token}`),

  // Resend verification email
  resendVerificationEmail: () =>
    api.post('/auth/resend-verification'),

  // Google OAuth - Get auth URL
  getGoogleAuthUrl: () =>
    api.get('/auth/google'),

  // Google OAuth - Handle callback
  googleCallback: (code: string) =>
    api.post('/auth/google/callback', { code }),

  // GitHub OAuth - Get auth URL
  getGithubAuthUrl: () =>
    api.get('/auth/github'),

  // GitHub OAuth - Handle callback
  githubCallback: (code: string) =>
    api.post('/auth/github/callback', { code }),

  // Check if email exists
  checkEmail: (email: string) =>
    api.post('/auth/check-email', { email }),

  // Delete account
  deleteAccount: (password: string) =>
    api.delete('/auth/account', { data: { password } }),
};


// ============================================
// PRODUCTS API
// ============================================
export const productsApi = {
  // Get all products with filters
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sort?: string;
    featured?: boolean;
    brand?: string;
  }) => api.get('/products', { params }),

  // Get single product by ID
  getOne: (id: string) => api.get(`/products/${id}`),

  // Get product by slug
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),

  // Get featured products
  getFeatured: (limit?: number) => 
    api.get('/products/featured/list', { params: { limit } }),

  // Get all categories
  getCategories: () => api.get('/products/categories/list'),

  // Get products by category
  getByCategory: (category: string, params?: any) =>
    api.get(`/products/category/${category}`, { params }),

  // Get related products
  getRelated: (id: string, limit?: number) =>
    api.get(`/products/${id}/related`, { params: { limit } }),

  // Search products
  search: (query: string, params?: any) =>
    api.get('/products/search', { params: { q: query, ...params } }),

  // Create product (Admin)
  create: (data: any) => api.post('/products', data),

  // Update product (Admin)
  update: (id: string, data: any) => api.put(`/products/${id}`, data),

  // Delete product (Admin)
  delete: (id: string) => api.delete(`/products/${id}`),

  // Add product review
  addReview: (id: string, data: { rating: number; comment: string }) =>
    api.post(`/products/${id}/reviews`, data),

  // Get product reviews
  getReviews: (id: string, params?: { page?: number; limit?: number }) =>
    api.get(`/products/${id}/reviews`, { params }),

  // Delete review (Admin)
  deleteReview: (productId: string, reviewId: string) =>
    api.delete(`/products/${productId}/reviews/${reviewId}`),

  // Upload product images
  uploadImages: (formData: FormData) =>
    api.post('/products/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete product image
  deleteImage: (productId: string, imageUrl: string) =>
    api.delete(`/products/${productId}/images`, { data: { imageUrl } }),

  // Get product statistics (Admin)
  getStats: () => api.get('/products/stats'),

  // Bulk update products (Admin)
  bulkUpdate: (ids: string[], data: any) =>
    api.put('/products/bulk', { ids, ...data }),

  // Bulk delete products (Admin)
  bulkDelete: (ids: string[]) =>
    api.delete('/products/bulk', { data: { ids } }),
};

// ============================================
// CART API
// ============================================
export const cartApi = {
  // Get current cart
  get: () => api.get('/cart'),

  // Add item to cart
  add: (productId: string, quantity: number = 1) =>
    api.post('/cart', { productId, quantity }),

  // Update cart item quantity
  update: (itemId: string, quantity: number) =>
    api.put(`/cart/${itemId}`, { quantity }),

  // Remove item from cart
  remove: (itemId: string) => api.delete(`/cart/${itemId}`),

  // Clear entire cart
  clear: () => api.delete('/cart'),

  // Sync cart (for merging guest cart with user cart)
  sync: (items: { productId: string; quantity: number }[]) =>
    api.post('/cart/sync', { items }),

  // Apply coupon code
  applyCoupon: (code: string) =>
    api.post('/cart/coupon', { code }),

  // Remove coupon
  removeCoupon: () =>
    api.delete('/cart/coupon'),

  // Get cart count
  getCount: () => api.get('/cart/count'),
};

// ============================================
// ORDERS API
// ============================================
export const ordersApi = {
  // Create new order
  create: (data: {
    shippingAddress: {
      fullName: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: 'credit_card' | 'paypal' | 'cash_on_delivery';
    notes?: string;
  }) => api.post('/orders', data),

  // Get user's orders
  getMyOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/orders', { params }),

  // Get single order
  getOne: (id: string) => api.get(`/orders/${id}`),

  // Get order by order number
  getByOrderNumber: (orderNumber: string) =>
    api.get(`/orders/number/${orderNumber}`),

  // Cancel order
  cancel: (id: string, reason?: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),

  // Pay order
  pay: (id: string, paymentResult: {
    id?: string;
    status?: string;
    updateTime?: string;
    email?: string;
  }) => api.put(`/orders/${id}/pay`, paymentResult),

  // Track order
  track: (id: string) => api.get(`/orders/${id}/track`),

  // Get order invoice
  getInvoice: (id: string) =>
    api.get(`/orders/${id}/invoice`, { responseType: 'blob' }),

  // Reorder (create new order from previous order)
  reorder: (id: string) => api.post(`/orders/${id}/reorder`),
};

// ============================================
// ADMIN API
// ============================================
export const adminApi = {
  // Get dashboard statistics
  getDashboard: () => api.get('/admin/dashboard'),

  // Get detailed analytics
  getAnalytics: (period?: string) => 
    api.get('/admin/analytics', { params: { period } }),

  // Get revenue analytics
  getRevenue: (params?: { startDate?: string; endDate?: string; period?: string }) =>
    api.get('/admin/revenue', { params }),

  // ---- Orders Management ----
  getOrders: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => api.get('/admin/orders', { params }),

  getOrder: (id: string) => api.get(`/admin/orders/${id}`),

  updateOrderStatus: (id: string, status: string, note?: string) =>
    api.put(`/admin/orders/${id}/status`, { status, note }),

   updateOrderPayment: (id: string, isPaid: boolean) =>
    api.put(`/admin/orders/${id}/payment`, { isPaid }),
  
  deleteOrder: (id: string) => api.delete(`/admin/orders/${id}`),

  // ---- Users Management ----
  getUsers: (params?: { 
    page?: number; 
    limit?: number; 
    role?: string;
    search?: string;
    isActive?: boolean;
  }) => api.get('/admin/users', { params }),

  getUser: (id: string) => api.get(`/admin/users/${id}`),

  createUser: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    phone?: string;
  }) => api.post('/admin/users', data),

  updateUser: (id: string, data: {
    name?: string;
    email?: string;
    role?: string;
    phone?: string;
    isActive?: boolean;
  }) => api.put(`/admin/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  toggleUserStatus: (id: string) =>
    api.put(`/admin/users/${id}/toggle-status`),

  // ---- Products Management ----
  getProducts: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    isActive?: boolean;
  }) => api.get('/admin/products', { params }),

  // ---- Categories Management ----
  getCategories: () => api.get('/admin/categories'),

  createCategory: (data: { name: string; description?: string; image?: string }) =>
    api.post('/admin/categories', data),

  updateCategory: (id: string, data: { name?: string; description?: string; image?: string }) =>
    api.put(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  // ---- Reports ----
  getSalesReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/admin/reports/sales', { params }),

  getInventoryReport: () => api.get('/admin/reports/inventory'),

  getCustomerReport: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/admin/reports/customers', { params }),

  exportReport: (type: string, params?: any) =>
    api.get(`/admin/reports/export/${type}`, { 
      params, 
      responseType: 'blob' 
    }),

  // ---- Settings ----
  getSettings: () => api.get('/admin/settings'),

  updateSettings: (data: any) => api.put('/admin/settings', data),

  // ---- Coupons ----
  getCoupons: (params?: { page?: number; limit?: number; isActive?: boolean }) =>
    api.get('/admin/coupons', { params }),

  createCoupon: (data: {
    code: string;
    discount: number;
    discountType: 'percentage' | 'fixed';
    minPurchase?: number;
    maxUses?: number;
    expiresAt?: string;
  }) => api.post('/admin/coupons', data),

  updateCoupon: (id: string, data: any) =>
    api.put(`/admin/coupons/${id}`, data),

  deleteCoupon: (id: string) => api.delete(`/admin/coupons/${id}`),

  // ---- Notifications ----
  sendNotification: (data: {
    title: string;
    message: string;
    type: 'all' | 'users' | 'admins';
    userIds?: string[];
  }) => api.post('/admin/notifications', data),
};
// ============================================
// USER API (for user-specific operations)
// ============================================
export const userApi = {
  // Get user profile
  getProfile: () => api.get('/users/profile'),

  // Update profile
  updateProfile: (data: any) => api.put('/users/profile', data),

  // Upload avatar
  uploadAvatar: (formData: FormData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete avatar
  deleteAvatar: () => api.delete('/users/avatar'),

  // Get user addresses
  getAddresses: () => api.get('/users/addresses'),

  // Add address
  addAddress: (data: any) => api.post('/users/addresses', data),

  // Update address
  updateAddress: (id: string, data: any) =>
    api.put(`/users/addresses/${id}`, data),

  // Delete address
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),

  // Set default address
  setDefaultAddress: (id: string) =>
    api.put(`/users/addresses/${id}/default`),
};

// ============================================
// WISHLIST API
// ============================================
export const wishlistApi = {
  // Get wishlist
  get: () => api.get('/users/wishlist'),

  // Add to wishlist
  add: (productId: string) => api.post(`/users/wishlist/${productId}`),

  // Remove from wishlist
  remove: (productId: string) => api.delete(`/users/wishlist/${productId}`),

  // Check if product is in wishlist
  check: (productId: string) => api.get(`/users/wishlist/check/${productId}`),

  // Clear wishlist
  clear: () => api.delete('/users/wishlist'),

  // Move to cart
  moveToCart: (productId: string) =>
    api.post(`/users/wishlist/${productId}/move-to-cart`),

  // Move all to cart
  moveAllToCart: () => api.post('/users/wishlist/move-all-to-cart'),
};

// ============================================
// REVIEWS API
// ============================================
export const reviewsApi = {
  // Get reviews for a product
  getProductReviews: (productId: string, params?: { page?: number; limit?: number; sort?: string }) =>
    api.get(`/reviews/product/${productId}`, { params }),

  // Get user's reviews
  getMyReviews: (params?: { page?: number; limit?: number }) =>
    api.get('/reviews/my-reviews', { params }),

  // Create review
  create: (productId: string, data: { rating: number; comment: string; title?: string }) =>
    api.post(`/reviews/product/${productId}`, data),

  // Update review
  update: (reviewId: string, data: { rating?: number; comment?: string; title?: string }) =>
    api.put(`/reviews/${reviewId}`, data),

  // Delete review
  delete: (reviewId: string) => api.delete(`/reviews/${reviewId}`),

  // Mark review as helpful
  markHelpful: (reviewId: string) =>
    api.post(`/reviews/${reviewId}/helpful`),

  // Report review
  report: (reviewId: string, reason: string) =>
    api.post(`/reviews/${reviewId}/report`, { reason }),
};

// ============================================
// NOTIFICATIONS API
// ============================================
export const notificationsApi = {
  // Get user notifications
  getAll: (params?: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),

  // Mark as read
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),

  // Delete notification
  delete: (id: string) => api.delete(`/notifications/${id}`),

  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // Update notification preferences
  updatePreferences: (data: {
    email?: boolean;
    push?: boolean;
    orderUpdates?: boolean;
    promotions?: boolean;
  }) => api.put('/notifications/preferences', data),
};

// ============================================
// SEARCH API
// ============================================
export const searchApi = {
  // Global search
  search: (query: string, params?: {
    type?: 'all' | 'products' | 'categories';
    limit?: number;
  }) => api.get('/search', { params: { q: query, ...params } }),

  // Get search suggestions
  getSuggestions: (query: string) =>
    api.get('/search/suggestions', { params: { q: query } }),

  // Get popular searches
  getPopular: () => api.get('/search/popular'),

  // Get recent searches (user-specific)
  getRecent: () => api.get('/search/recent'),

  // Clear recent searches
  clearRecent: () => api.delete('/search/recent'),
};

// ============================================
// CONTACT/SUPPORT API
// ============================================
export const supportApi = {
  // Submit contact form
  submitContact: (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => api.post('/contact', data),

  // Submit support ticket
  createTicket: (data: {
    subject: string;
    message: string;
    category: string;
    orderId?: string;
  }) => api.post('/support/tickets', data),

  // Get user's tickets
  getMyTickets: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/support/tickets', { params }),

  // Get ticket by ID
  getTicket: (id: string) => api.get(`/support/tickets/${id}`),

  // Reply to ticket
  replyToTicket: (id: string, message: string) =>
    api.post(`/support/tickets/${id}/reply`, { message }),

  // Close ticket
  closeTicket: (id: string) => api.put(`/support/tickets/${id}/close`),

  // Get FAQs
  getFaqs: (category?: string) =>
    api.get('/support/faqs', { params: { category } }),
};

// ============================================
// PAYMENT API
// ============================================
export const paymentApi = {
  // Create payment intent (Stripe)
  createPaymentIntent: (orderId: string) =>
    api.post('/payments/create-intent', { orderId }),

  // Confirm payment
  confirmPayment: (paymentIntentId: string) =>
    api.post('/payments/confirm', { paymentIntentId }),

  // Get payment methods
  getPaymentMethods: () => api.get('/payments/methods'),

  // Add payment method
  addPaymentMethod: (paymentMethodId: string) =>
    api.post('/payments/methods', { paymentMethodId }),

  // Remove payment method
  removePaymentMethod: (paymentMethodId: string) =>
    api.delete(`/payments/methods/${paymentMethodId}`),

  // Set default payment method
  setDefaultPaymentMethod: (paymentMethodId: string) =>
    api.put(`/payments/methods/${paymentMethodId}/default`),

  // Create PayPal order
  createPaypalOrder: (orderId: string) =>
    api.post('/payments/paypal/create', { orderId }),

  // Capture PayPal payment
  capturePaypalPayment: (paypalOrderId: string) =>
    api.post('/payments/paypal/capture', { paypalOrderId }),
};

// ============================================
// SHIPPING API
// ============================================
export const shippingApi = {
  // Get shipping rates
  getRates: (data: {
    address: {
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    items: { productId: string; quantity: number }[];
  }) => api.post('/shipping/rates', data),

  // Get shipping methods
  getMethods: () => api.get('/shipping/methods'),

  // Track shipment
  track: (trackingNumber: string, carrier?: string) =>
    api.get('/shipping/track', { params: { trackingNumber, carrier } }),

  // Validate address
  validateAddress: (address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) => api.post('/shipping/validate-address', address),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Helper to handle file downloads
export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response.data]);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

// Helper to upload files with progress
export const uploadWithProgress = (
  url: string,
  formData: FormData,
  onProgress: (progress: number) => void
) => {
  return api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const progress = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 0;
      onProgress(progress);
    },
  });
};


// Export default api instance
export default api;