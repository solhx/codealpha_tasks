//frontend/src/components/common/CommentSection.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import api from '../../api/axios';
import Avatar from './Avatar';
import toast from 'react-hot-toast';

const CommentSection = ({ postId, initialComments = [] }) => {
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      setFetching(true);
      try {
        const { data } = await api.get(`/comments/${postId}`);
        setComments(data.comments);
      } catch {
        // Use initial
        setComments(
          initialComments.map((c) =>
            typeof c === 'object' && c.user ? c : null
          ).filter(Boolean)
        );
      } finally {
        setFetching(false);
      }
    };
    fetchComments();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/comments/${postId}`, { content: text });
      setComments((prev) => [data.comment, ...prev]);
      setText('');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--border)',
        padding: '0.875rem 1rem',
        background: 'var(--bg-secondary)',
      }}
    >
      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}
      >
        <Avatar src={user?.profilePicture} size={32} username={user?.username} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-input)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '0 0.5rem 0 1rem',
            gap: '0.5rem',
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={500}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              padding: '0.5rem 0',
              fontFamily: 'inherit',
            }}
          />
          <motion.button
            type="submit"
            disabled={!text.trim() || loading}
            whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: text.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: text.trim() ? '#fff' : 'var(--text-muted)',
              border: 'none',
              cursor: text.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
          >
            <FiSend size={14} />
          </motion.button>
        </div>
      </form>

      {/* Comments List */}
      {fetching ? (
        <div style={{ padding: '0.5rem 0' }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 10, width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.875rem' }}
            >
              <Link to={`/profile/${comment.user?.username}`}>
                <Avatar src={comment.user?.profilePicture} size={32} username={comment.user?.username} />
              </Link>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    background: 'var(--bg-card)',
                    padding: '0.5rem 0.875rem',
                    borderRadius: '0 var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <Link
                    to={`/profile/${comment.user?.username}`}
                    style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.15rem' }}
                  >
                    {comment.user?.username}
                  </Link>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {comment.content}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem', paddingLeft: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                  {(comment.user?._id?.toString() === user?._id?.toString() || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.72rem',
                        color: 'var(--error)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <FiTrash2 size={11} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default CommentSection;