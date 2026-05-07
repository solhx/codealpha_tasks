//backend/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    image: {
      type: String,
      default: '',
    },
    imagePublicId: { type: String, default: '' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    tags: [String],
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: like count
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Virtual: comment count
postSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Text index for search
postSchema.index({ content: 'text', tags: 'text' });

module.exports = mongoose.model('Post', postSchema);