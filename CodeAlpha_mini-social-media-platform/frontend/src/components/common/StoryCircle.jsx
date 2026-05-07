//frontend/src/components/common/StoryCircle.jsx
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Avatar from './Avatar';
import StoryRing from './StoryRing';

/* ─────────────────────────────────────────────────────────────────────────
   StoryCircle
   Renders a clickable story circle for OTHER users (not the logged-in user).
   Only opens the viewer if the user has a REAL story (not just profilePicture).
───────────────────────────────────────────────────────────────────────── */
const StoryCircle = ({ user, story }) => {
  const [viewing, setViewing] = useState(false);
  const [paused, setPaused] = useState(false);

  // ✅ Only treat it as a real story if it has an actual story image
  // We no longer fall back to profilePicture as a fake "story"
  const hasRealStory = Boolean(story?.image && story.image !== user?.profilePicture);
  const storyImage = hasRealStory ? story.image : null;

  const handleOpen = () => {
    if (!storyImage) return; // ✅ Do nothing if no real story
    setViewing(true);
  };

  const handleClose = () => {
    setViewing(false);
    setPaused(false);
  };

  return (
    <>
      {/* ── Clickable circle ── */}
      <motion.div
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: storyImage ? 0.94 : 1 }}
        onClick={handleOpen}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          // ✅ Only show pointer cursor if there's a real story
          cursor: storyImage ? 'pointer' : 'default',
          flexShrink: 0,
        }}
      >
        {/* ✅ Only show gradient ring if user has a real story */}
        <StoryRing size={68} hasStory={hasRealStory}>
          <Avatar
            src={user?.profilePicture}
            size={58}
            username={user?.username}
          />
        </StoryRing>

        <span
          style={{
            fontSize: '0.72rem',
            color: 'var(--text-secondary)',
            maxWidth: 68,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            // ✅ Bold username only if they have a real story (like Instagram)
            fontWeight: hasRealStory ? 700 : 500,
          }}
        >
          {user?.username}
        </span>
      </motion.div>

      {/* ── Fullscreen viewer via portal ── */}
      {viewing &&
        createPortal(
          <StoryViewer
            image={storyImage}
            username={user?.username}
            avatar={user?.profilePicture}
            paused={paused}
            setPaused={setPaused}
            onClose={handleClose}
          />,
          document.body
        )}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   StoryViewer  (reusable single-story viewer)
───────────────────────────────────────────────────────────────────────── */
export const StoryViewer = ({
  image,
  username,
  avatar,
  paused,
  setPaused,
  onClose,
}) => (
  <motion.div
    key="story-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}
  >
    <motion.div
      key="story-card"
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.88, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        borderRadius: 24,
        overflow: 'hidden',
        background: '#111',
        boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 12,
          right: 12,
          height: 3,
          background: 'rgba(255,255,255,0.3)',
          borderRadius: 99,
          overflow: 'hidden',
          zIndex: 20,
        }}
      >
        <motion.div
          key={image}
          initial={{ width: '0%' }}
          animate={{ width: paused ? undefined : '100%' }}
          transition={{ duration: 5, ease: 'linear' }}
          onAnimationComplete={onClose}
          style={{ height: '100%', background: '#fff', borderRadius: 99 }}
        />
      </div>

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 22,
          left: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid rgba(255,255,255,0.8)',
              flexShrink: 0,
              background: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt={username}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              username?.[0]?.toUpperCase()
            )}
          </div>
          <p
            style={{
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {username}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <FiX size={16} />
        </button>
      </div>

      {/* Story image */}
      {image ? (
        <img
          src={image}
          alt="story"
          draggable={false}
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onError={(e) => {
            e.currentTarget.src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560"><rect width="420" height="560" fill="%23222"/><text x="50%25" y="50%25" fill="%23888" text-anchor="middle" font-size="16" dy=".3em">Image unavailable</text></svg>';
          }}
          style={{
            width: '100%',
            minHeight: 520,
            maxHeight: '80vh',
            objectFit: 'cover',
            display: 'block',
            userSelect: 'none',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: 560,
            background: 'linear-gradient(135deg,#6366f1,#ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{ color: '#fff', opacity: 0.7 }}>No image available</p>
        </div>
      )}

      {/* Tap zones */}
      <div
        style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 10 }}
      >
        <div
          style={{ flex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
        <div
          style={{ flex: 1 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      </div>
    </motion.div>
  </motion.div>
);

export default StoryCircle;