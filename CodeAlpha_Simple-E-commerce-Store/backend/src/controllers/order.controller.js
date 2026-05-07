import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import Coupon from '../models/Coupon.model.js';

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Get user's cart with coupon populated
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product')
      .populate('coupon');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify stock and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products no longer exist'
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '/placeholder.png',
        price: product.price,
        quantity: item.quantity
      });
    }

    // Calculate prices
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    
    // Calculate discount if coupon is applied
    let discountAmount = 0;
    let couponCode = null;

    if (cart.coupon) {
      const coupon = cart.coupon;
      
      // Verify coupon is still valid
      const now = new Date();
      if (coupon.isActive && coupon.expiresAt > now) {
        // Check if user already used this coupon
        const userUsed = coupon.usedBy?.find(
          u => u.user.toString() === req.user._id.toString()
        );
        
        if (!userUsed && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
          if (itemsPrice >= coupon.minPurchase) {
            discountAmount = coupon.calculateDiscount(itemsPrice);
            couponCode = coupon.code;

            // Update coupon usage
            await Coupon.findByIdAndUpdate(coupon._id, {
              $inc: { usedCount: 1 },
              $push: { usedBy: { user: req.user._id, usedAt: new Date() } }
            });
          }
        }
      }
    }

    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number(((itemsPrice - discountAmount) * 0.1).toFixed(2));
    const totalPrice = itemsPrice - discountAmount + shippingPrice + taxPrice;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountAmount,
      couponCode,
      totalPrice,
      notes,
      isPaid: paymentMethod === 'cash_on_delivery' ? false : false
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart (including coupon)
    cart.items = [];
    cart.coupon = null;
    await cart.save();

    // Populate user info
    await order.populate('user', 'name email');

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders
export const getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { user: req.user._id };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
export const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.updateTime,
      email: req.body.email
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order'
      });
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};