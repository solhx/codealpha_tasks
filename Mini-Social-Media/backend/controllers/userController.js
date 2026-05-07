//backend/controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const AppError = require('../utils/AppError');
const sendNotification = require('../utils/sendNotification');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get user profile by username
// @route   GET /api/users/:username
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username profilePicture isVerified')
      .populate('following', 'username profilePicture isVerified');

    if (!user) return next(new AppError('User not found', 404));

    const posts = await Post.find({ user: user._id, isPublic: true })
      .sort('-createdAt')
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePicture' },
      });

    res.status(200).json({ success: true, user, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { username, bio, website, location } = req.body;
    const updates = { bio, website, location };

    if (username && username !== req.user.username) {
      const exists = await User.findOne({ username });
      if (exists) return next(new AppError('Username already taken', 400));
      updates.username = username;
    }

    if (req.files?.profilePicture) {
      // Delete old image
      if (req.user.profilePicturePublicId) {
        await cloudinary.uploader.destroy(req.user.profilePicturePublicId);
      }
      updates.profilePicture = req.files.profilePicture[0].path;
      updates.profilePicturePublicId = req.files.profilePicture[0].filename;
    }

    if (req.files?.coverPhoto) {
      updates.coverPhoto = req.files.coverPhoto[0].path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Follow / Unfollow a user
// @route   PUT /api/users/:id/follow
const followUnfollowUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('You cannot follow yourself', 400));
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return next(new AppError('User not found', 404));

    const currentUser = await User.findById(req.user._id);
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
      res.status(200).json({ success: true, action: 'unfollowed' });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user._id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user._id } });

      // Send notification
      const io = req.app.get('io');
      await sendNotification(io, {
        sender: req.user._id,
        receiver: targetUser._id,
        type: 'follow',
      });

      res.status(200).json({ success: true, action: 'followed' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search?q=term
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ],
      isActive: true,
    })
      .select('username profilePicture bio isVerified followers')
      .limit(20);

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users
// @route   GET /api/users/suggestions
const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const users = await User.find({
      _id: { $nin: [...currentUser.following, req.user._id] },
      isActive: true,
    })
      // ✅ FIX: added 'stories' to the select so StoryCircle gets real story data
      .select('username profilePicture bio isVerified followers stories')
      .limit(5);

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Save / Unsave a post
// @route   PUT /api/users/save/:postId
const saveUnsavePost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(req.params.postId);

    if (isSaved) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedPosts: req.params.postId } });
      res.status(200).json({ success: true, action: 'unsaved' });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { savedPosts: req.params.postId } });
      res.status(200).json({ success: true, action: 'saved' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved posts
// @route   GET /api/users/saved
const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'user', select: 'username profilePicture' },
    });

    res.status(200).json({ success: true, posts: user.savedPosts });
  } catch (error) {
    next(error);
  }
};

// @desc    Add story
// @route   POST /api/users/story
const addStory = async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('Please upload an image', 400));

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          stories: {
            image: req.file.path,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      },
      { new: true }
    );

    res.status(201).json({ success: true, story: user.stories[user.stories.length - 1] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users/admin/all
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};
const getFollowingStories = async (req, res, next) => {
  try {
    const now = new Date();

    // Step 1: get who the current user follows
    const currentUser = await User.findById(req.user._id).select('following');
    if (!currentUser.following.length) {
      return res.status(200).json({ success: true, users: [] });
    }

    // Step 2: from those followed users, only return ones
    //         who have at least one non-expired story
    const users = await User.find({
      _id:                   { $in: currentUser.following },
      'stories.expiresAt':   { $gt: now },   // ← at least one active story
      isActive:              true,
    }).select('username profilePicture stories');

    // Step 3: strip expired stories from each user before sending
    const result = users.map((u) => {
      const obj    = u.toObject();
      obj.stories  = obj.stories.filter((s) => new Date(s.expiresAt) > now);
      return obj;
    });

    res.status(200).json({ success: true, users: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  followUnfollowUser,
  searchUsers,
  getSuggestedUsers,
  saveUnsavePost,
  getSavedPosts,
  addStory,
  getAllUsers,
  getFollowingStories,
};