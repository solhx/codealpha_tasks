//backend/controllers/commentController.js
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const sendNotification = require('../utils/sendNotification');

// @desc    Add a comment
// @route   POST /api/comments/:postId
const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return next(new AppError('Post not found', 404));

    const comment = await Comment.create({
      user: req.user._id,
      post: req.params.postId,
      content: req.body.content,
      parentComment: req.body.parentComment || null,
    });

    await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: comment._id } });
    await comment.populate('user', 'username profilePicture isVerified');

    // Send notification
    const io = req.app.get('io');
    if (post.user.toString() !== req.user._id.toString()) {
      await sendNotification(io, {
        sender: req.user._id,
        receiver: post.user,
        type: 'comment',
        post: post._id,
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(new AppError('Comment not found', 404));

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new AppError('Not authorized to delete this comment', 403));
    }

    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();

    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a post
// @route   GET /api/comments/:postId
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .sort('-createdAt')
      .populate('user', 'username profilePicture isVerified');

    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, deleteComment, getComments };