// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: Address;
  avatar?: string;
  wishlist?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// Product Types
export interface ProductImage {
  url: string;
  alt?: string;
}

export interface Specification {
  key: string;
  value: string;
}

export interface Review {
  _id: string;
  user: string | User;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  images: ProductImage[];
  stock: number;
  sku?: string;
  featured: boolean;
  isActive: boolean;
  reviews: Review[];
  rating: number;
  numReviews: number;
  tags?: string[];
  specifications?: Specification[];
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// Order Types
export interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type PaymentMethod = 'credit_card' | 'paypal' | 'cash_on_delivery';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface PaymentResult {
  id?: string;
  status?: string;
  updateTime?: string;
  email?: string;
}

export interface Order {
  _id: string;
  user: string | User;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  pages: number;
  currentPage: number;
  products?: T[];
  orders?: T[];
  users?: T[];
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Dashboard Stats
export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  ordersByStatus: { _id: string; count: number }[];
  monthlyRevenue: {
    _id: { year: number; month: number };
    total: number;
    count: number;
  }[];
  recentOrders: Order[];
}

// Filter Types
export interface ProductFilters {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

// Form Types
export interface CheckoutFormData {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  category: string;
  brand?: string;
  stock: number;
  sku?: string;
  featured: boolean;
  isActive: boolean;
  images: ProductImage[];
  specifications?: Specification[];
  tags?: string[];
}

// Coupon Types
export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  minPurchase: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  isValid?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppliedCoupon {
  _id: string;
  code: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
}

// Update Cart interface
export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  coupon?: AppliedCoupon | null;
}