//frontend/src/pages/Notifications.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiUserPlus, FiBell, FiCheck } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import {
  fetchNotifications,
  markAllNotificationsRead,
} from '../redux/slices/notificationSlice';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';

const iconMap = {
  like:    { icon: <FiHeart size={14} />,       color: '#ef4444', bg: '#fef2f2' },
  comment: { icon: <FiMessageCircle size={14} />, color: '#6366f1', bg: '#eef2ff' },
  follow:  { icon: <FiUserPlus size={14} />,     color: '#10b981', bg: '#f0fdf4' },
  mention: { icon: <FiBell size={14} />,         color: '#f59e0b', bg: '#fffbeb' },
};

const messageMap = {
  like:    'liked your post',
  comment: 'commented on your post',
  follow:  'started following you',
  mention: 'mentioned you in a post',
};

const Notifications = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const handleMarkAllRead = () => dispatch(markAllNotificationsRead());

  if (loading && items.length === 0)
    return <Loader fullScreen text="Loading notifications..." />;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
            Notifications
          </h2>
          {unreadCount > 0 && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead} icon={<FiCheck size={14} />}>
            Mark all read
          </Button>
        )}
      </motion.div>

      {/* Empty state */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ padding: '4rem', textAlign: 'center' }}
        >
          <FiBell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
            No notifications yet
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            When people like, comment, or follow you, they&apos;ll appear here.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ overflow: 'hidden' }}
        >
          <AnimatePresence>
            {items.map((notif, i) => {
              const meta = iconMap[notif.type] || iconMap.mention;
              return (
                <motion.div
                  key={notif._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    if (notif.post) navigate(`/`);
                    else navigate(`/profile/${notif.sender?.username}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom:
                      i < items.length - 1 ? '1px solid var(--border)' : 'none',
                    background: notif.isRead ? 'transparent' : 'var(--accent-light)',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = 'var(--bg-hover)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notif.isRead
                      ? 'transparent'
                      : 'var(--accent-light)')
                  }
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar
                      src={notif.sender?.profilePicture}
                      size={46}
                      username={notif.sender?.username}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: meta.bg,
                        border: '2px solid var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: meta.color,
                      }}
                    >
                      {meta.icon}
                    </div>
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <strong style={{ fontWeight: 700 }}>{notif.sender?.username}</strong>{' '}
                      {messageMap[notif.type] || 'interacted with you'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Post thumbnail */}
                  {notif.post?.image && (
                    <img
                      src={notif.post.image}
                      alt="post"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {/* Unread dot */}
                  {!notif.isRead && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Notifications;