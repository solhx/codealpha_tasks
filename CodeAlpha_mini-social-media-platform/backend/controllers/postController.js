//backend/controllers/postController.js
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const AppError = require('../utils/AppError');
const sendNotification = require('../utils/sendNotification');
const { cloudinary } = require('../config/cloudinary');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Create a post
// @route   POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { content, tags } = req.body;

    if (!content && !req.file) {
      return next(new AppError('Post must have content or an image', 400));
    }

    const postData = {
      user: req.user._id,
      content: content || '',
      tags: tags ? tags.split(',').map((t) => t.trim()) : [],
    };

    if (req.file) {
      postData.image = req.file.path;
      postData.imagePublicId = req.file.filename;
    }

    const post = await Post.create(postData);
    await post.populate('user', 'username profilePicture isVerified');

    // Emit to followers via socket
    const io = req.app.get('io');
    const currentUser = await User.findById(req.user._id);
    currentUser.followers.forEach((followerId) => {
      io.to(followerId.toString()).emit('newPost', post);
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get home feed posts
// @route   GET /api/posts/feed
const getFeedPosts = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const userIds = [req.user._id, ...currentUser.following];

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({ user: { $in: userIds }, isPublic: true })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('user', 'username profilePicture isVerified')
        .populate({
          path: 'comments',
          options: { sort: { createdAt: -1 }, limit: 3 },
          populate: { path: 'user', select: 'username profilePicture' },
        }),
      Post.countDocuments({ user: { $in: userIds }, isPublic: true }),
    ]);

    res.status(200).json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public posts (Explore)
// @route   GET /api/posts/explore
const getExplorePosts = async (req, res, next) => {
  try {
    const features = new APIFeatures(Post.find({ isPublic: true }), req.query)
      .sort()
      .paginate();

    const posts = await features.query
      .populate('user', 'username profilePicture isVerified')
      .populate({
        path: 'comments',
        options: { limit: 2 },
        populate: { path: 'user', select: 'username profilePicture' },
      });

    res.status(200).json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture isVerified bio followers')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePicture' },
      });

    if (!post) return next(new AppError('Post not found', 404));

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError('Post not found', 404));
    if (post.user.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to edit this post', 403));
    }

    const { content, tags } = req.body;
    post.content = content || post.content;
    post.tags = tags ? tags.split(',').map((t) => t.trim()) : post.tags;

    if (req.file) {
      if (post.imagePublicId) await cloudinary.uploader.destroy(post.imagePublicId);
      post.image = req.file.path;
      post.imagePublicId = req.file.filename;
    }

    await post.save();
    await post.populate('user', 'username profilePicture isVerified');

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError('Post not found', 404));

    const isOwner = post.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('Not authorized to delete this post', 403));
    }

    if (post.imagePublicId) await cloudinary.uploader.destroy(post.imagePublicId);
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like / Unlike a post
// @route   PUT /api/posts/:id/like
const likeUnlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError('Post not found', 404));

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      await Post.findByIdAndUpdate(req.params.id, { $pull: { likes: req.user._id } });
      res.status(200).json({ success: true, action: 'unliked', likes: post.likes.length - 1 });
    } else {
      await Post.findByIdAndUpdate(req.params.id, { $push: { likes: req.user._id } });

      const io = req.app.get('io');
      if (post.user.toString() !== req.user._id.toString()) {
        await sendNotification(io, {
          sender: req.user._id,
          receiver: post.user,
          type: 'like',
          post: post._id,
        });
      }

      res.status(200).json({ success: true, action: 'liked', likes: post.likes.length + 1 });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getPost,
  updatePost,
  deletePost,
  likeUnlikePost,
};