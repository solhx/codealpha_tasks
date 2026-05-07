import express from 'express';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Add to wishlist
router.post('/wishlist/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.wishlist.includes(req.params.productId)) {
      user.wishlist.push(req.params.productId);
      await user.save();
    }

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
});

// Get wishlist
router.get('/wishlist', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price images slug');

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
});

export default router;