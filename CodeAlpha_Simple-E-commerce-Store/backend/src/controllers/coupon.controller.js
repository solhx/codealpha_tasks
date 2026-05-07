import Coupon from '../models/Coupon.model.js';
import Cart from '../models/Cart.model.js';

// @desc    Validate and get coupon details
// @route   POST /api/coupons/validate
export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if expired
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum usage limit'
      });
    }

    // Check if user already used this coupon
    const userUsed = coupon.usedBy.find(
      u => u.user.toString() === req.user._id.toString()
    );
    if (userUsed) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Get user's cart to calculate discount
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'price');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    const subtotal = cart.subtotal;

    // Check minimum purchase
    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of 
$$
{coupon.minPurchase} required`
      });
    }

    const discountAmount = coupon.calculateDiscount(subtotal);

    res.status(200).json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType,
        discountAmount,
        minPurchase: coupon.minPurchase
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to cart
// @route   POST /api/cart/coupon
export const applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check if expired
    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has expired'
      });
    }

    // Check max uses
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This coupon has reached its maximum usage limit'
      });
    }

    // Check if user already used this coupon
    const userUsed = coupon.usedBy.find(
      u => u.user.toString() === req.user._id.toString()
    );
    if (userUsed) {
      return res.status(400).json({
        success: false,
        message: 'You have already used this coupon'
      });
    }

    // Get user's cart
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images stock slug');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    const subtotal = cart.subtotal;

    // Check minimum purchase
    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of
$$
{coupon.minPurchase} required`
      });
    }

    // Apply coupon to cart
    cart.coupon = coupon._id;
    await cart.save();

    // Reload cart with coupon populated
    cart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock slug')
      .populate('coupon');

    const discountAmount = coupon.calculateDiscount(subtotal);

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.itemCount,
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          discount: coupon.discount,
          discountType: coupon.discountType,
          discountAmount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove coupon from cart
// @route   DELETE /api/cart/coupon
export const removeCoupon = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price images stock slug');

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.coupon = null;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Coupon removed',
      cart: {
        _id: cart._id,
        user: cart.user,
        items: cart.items,
        subtotal: cart.subtotal,
        itemCount: cart.itemCount,
        coupon: null
      }
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// ADMIN COUPON MANAGEMENT
// ============================================

// @desc    Get all coupons (Admin)
// @route   GET /api/admin/coupons
export const getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isActive, search } = req.query;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }

    const total = await Coupon.countDocuments(query);
    const coupons = await Coupon.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: coupons.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      coupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single coupon (Admin)
// @route   GET /api/admin/coupons/:id
export const getCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate('usedBy.user', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.status(200).json({
      success: true,
      coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (Admin)
// @route   POST /api/admin/coupons
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discount, discountType, minPurchase, maxDiscount, maxUses, expiresAt } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    // Validate percentage discount
    if (discountType === 'percentage' && discount > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount,
      discountType,
      minPurchase: minPurchase || 0,
      maxDiscount,
      maxUses,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/admin/coupons/:id
export const updateCoupon = async (req, res, next) => {
  try {
    const { code, discount, discountType, minPurchase, maxDiscount, maxUses, expiresAt, isActive } = req.body;

    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if new code already exists (if code is being changed)
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
      coupon.code = code.toUpperCase();
    }

    // Update fields
    if (discount !== undefined) coupon.discount = discount;
    if (discountType) coupon.discountType = discountType;
    if (minPurchase !== undefined) coupon.minPurchase = minPurchase;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (expiresAt) coupon.expiresAt = expiresAt;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/admin/coupons/:id
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle coupon status (Admin)
// @route   PUT /api/admin/coupons/:id/toggle
export const toggleCouponStatus = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon
    });
  } catch (error) {
    next(error);
  }
};