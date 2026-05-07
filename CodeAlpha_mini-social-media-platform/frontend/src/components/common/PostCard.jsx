//frontend/src/components/common/PostCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHeart, FiMessageCircle, FiShare2, FiBookmark,
  FiMoreHorizontal, FiTrash2, FiEdit3,
} from 'react-icons/fi';
import { FaHeart, FaBookmark } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { likeUnlikePost, deletePost } from '../../redux/slices/postSlice';
import Avatar from './Avatar';
import CommentSection from './CommentSection';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(user?.savedPosts?.includes(post._id));
  const [likeAnim, setLikeAnim] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likeCount ?? post.likes?.length ?? 0);
  const [isLiked, setIsLiked] = useState(
    post.isLiked ?? post.likes?.some((id) =>
      (typeof id === 'object' ? id._id : id)?.toString() === user?._id?.toString()
    )
  );

  const isOwner = post.user?._id?.toString() === user?._id?.toString();

  const handleLike = async () => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLocalLikes((prev) => (wasLiked ? prev - 1 : prev + 1));
    if (!wasLiked) {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 600);
    }
    dispatch(likeUnlikePost(post._id));
  };

  const handleSave = async () => {
    try {
      const { data } = await api.put(`/users/save/${post._id}`);
      setIsSaved(data.action === 'saved');
      toast.success(data.action === 'saved' ? 'Post saved!' : 'Post unsaved');
    } catch {
      toast.error('Failed to save post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    dispatch(deletePost(post._id));
    setShowMenu(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    toast.success('Link copied!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card"
      style={{ marginBottom: '1rem', overflow: 'hidden' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1rem 0.75rem',
        }}
      >
        <Link
          to={`/profile/${post.user?.username}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <Avatar
            src={post.user?.profilePicture}
            size={42}
            username={post.user?.username}
            hasStory={post.user?.hasStory}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {post.user?.username}
              </span>
              {post.user?.isVerified && (
                <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>✓</span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </Link>

        {/* Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <FiMoreHorizontal size={18} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  overflow: 'hidden',
                  zIndex: 100,
                  minWidth: '160px',
                }}
              >
                <button
                  onClick={handleSave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <FiBookmark size={14} />
                  {isSaved ? 'Unsave' : 'Save post'}
                </button>
                <button
                  onClick={handleShare}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    padding: '0.65rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <FiShare2 size={14} />
                  Copy link
                </button>
                {isOwner && (
                  <>
                    <div style={{ borderTop: '1px solid var(--border)' }} />
                    <button
                      onClick={handleDelete}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.65rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--error)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <FiTrash2 size={14} />
                      Delete post
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div style={{ padding: '0 1rem 0.75rem', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
          {post.content}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0 1rem 0.75rem' }}>
          {post.tags.map((tag) => (
            <span
              key={tag}
              style={{
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                borderRadius: 'var(--radius-full)',
                padding: '0.2rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Image */}
      {post.image && (
        <div style={{ overflow: 'hidden', maxHeight: '500px' }}>
          <img
            src={post.image}
            alt="post"
            style={{ width: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem 0.25rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>{localLikes > 0 ? `${localLikes} like${localLikes !== 1 ? 's' : ''}` : ''}</span>
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => setShowComments((p) => !p)}
        >
          {(post.commentCount ?? post.comments?.length ?? 0) > 0
            ? `${post.commentCount ?? post.comments?.length} comment${(post.commentCount ?? post.comments?.length) !== 1 ? 's' : ''}`
            : ''}
        </span>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.25rem 0.75rem',
          borderTop: '1px solid var(--border)',
          gap: '0.25rem',
        }}
      >
        <ActionButton
          onClick={handleLike}
          icon={
            isLiked ? (
              <motion.span
                animate={likeAnim ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.4 }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <FaHeart size={18} color="var(--error)" />
              </motion.span>
            ) : (
              <FiHeart size={18} />
            )
          }
          label={isLiked ? 'Unlike' : 'Like'}
          active={isLiked}
          activeColor="var(--error)"
        />
        <ActionButton
          onClick={() => setShowComments((p) => !p)}
          icon={<FiMessageCircle size={18} />}
          label="Comment"
        />
        <ActionButton
          onClick={handleShare}
          icon={<FiShare2 size={18} />}
          label="Share"
        />
        <div style={{ marginLeft: 'auto' }}>
          <ActionButton
            onClick={handleSave}
            icon={isSaved ? <FaBookmark size={18} color="var(--accent)" /> : <FiBookmark size={18} />}
            label={isSaved ? 'Saved' : 'Save'}
            active={isSaved}
            activeColor="var(--accent)"
          />
        </div>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CommentSection postId={post._id} initialComments={post.comments} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ActionButton = ({ onClick, icon, label, active, activeColor }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.5rem 0.75rem',
      borderRadius: 'var(--radius-md)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: active ? activeColor || 'var(--accent)' : 'var(--text-secondary)',
      fontSize: '0.82rem',
      fontWeight: 600,
      transition: 'all 0.2s',
    }}
  >
    {icon}
    <span style={{ display: 'none' }}>{label}</span>
  </motion.button>
);

export default PostCard;