/* frontend/src/components/common/StoryRow.jsx */
import { useEffect, useState, useRef } from 'react';
import { createPortal }                from 'react-dom';
import { useSelector }                 from 'react-redux';
import { motion, AnimatePresence }     from 'framer-motion';
import { FiPlus, FiCamera, FiEye, FiX } from 'react-icons/fi';
import api                             from '../../api/axios';
import StoryCircle                     from './StoryCircle';
import StoryRing                       from './StoryRing';
import Avatar                          from './Avatar';
import toast                           from 'react-hot-toast';

const StoryRow = () => {
  const { user }     = useSelector((s) => s.auth);
  const [storyUsers, setStoryUsers] = useState([]);
  const [myStories,  setMyStories]  = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [showMenu,   setShowMenu]   = useState(false);
  const [viewingOwn, setViewingOwn] = useState(false);
  const [menuPos,    setMenuPos]    = useState({ top: 0, left: 0 });

  const fileRef       = useRef();
  const anchorRef     = useRef(); // ✅ tracks avatar position for portal menu

  /* ── Fetch own stories ───────────────────────────────────────────── */
 useEffect(() => {
  const fetchData = async () => {
    try {
      // Fetch current user's own stories
      const { data: meData } = await api.get('/auth/me');
      const now    = new Date();
      const active = (meData.user?.stories || []).filter(
        (s) => new Date(s.expiresAt) > now
      );
      setMyStories(active);

      // ✅ FIX: fetch ONLY followed users who have active stories
      // Changed from /users/suggestions (unfollowed!) to /users/following/stories
      const { data: storiesData } = await api.get('/users/following/stories');
      setStoryUsers(storiesData.users);  // no .slice() needed — backend already filters
    } catch { /* silent */ }
  };
  fetchData();
}, [user?._id]);

  /* ── Open menu at correct screen position ────────────────────────── */
  const handleAvatarClick = () => {
    if (uploading) return;
    if (!showMenu) {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPos({
          top:  rect.bottom + 10,
          left: rect.left + rect.width / 2,
        });
      }
    }
    setShowMenu((p) => !p);
  };

  /* ── Upload ──────────────────────────────────────────────────────── */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }
    setUploading(true);
    setShowMenu(false);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await api.post('/users/story', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMyStories((prev) => [...prev, data.story]);
      toast.success('Story added! ✨ Expires in 24 hours');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload story');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card story-row"
      style={{
        padding:      '1rem',
        marginBottom: '1rem',
        background:   'var(--bg-card)',
        overflow:     'visible',
        position:     'relative',
        zIndex:       10,
      }}
    >
      <div className="story-scroll-inner">
        <div
          style={{
            display:    'flex',
            gap:        '1.25rem',
            alignItems: 'flex-start',
            minWidth:   'max-content',
          }}
        >
          {/* ── YOUR STORY ─────────────────────────────────────────── */}
          <motion.div
            ref={anchorRef}
            whileHover={{ scale: uploading ? 1 : 1.05 }}
            whileTap={{  scale: uploading ? 1 : 0.95 }}
            onClick={handleAvatarClick}
            style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           '0.4rem',
              cursor:        uploading ? 'wait' : 'pointer',
              flexShrink:    0,
              position:      'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              {myStories.length > 0 ? (
                <StoryRing size={68} hasStory>
                  <Avatar
                    src={user?.profilePicture}
                    size={58}
                    username={user?.username}
                  />
                </StoryRing>
              ) : (
                <div
                  style={{
                    width:          68,
                    height:         68,
                    borderRadius:   '50%',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    border:         '2.5px dashed var(--border)',
                    background:     'var(--bg-secondary)',
                    boxSizing:      'border-box',
                  }}
                >
                  <Avatar
                    src={user?.profilePicture}
                    size={56}
                    username={user?.username}
                  />
                </div>
              )}

              {/* + badge */}
              <div
                style={{
                  position:       'absolute',
                  bottom:         1,
                  right:          1,
                  width:          22,
                  height:         22,
                  borderRadius:   '50%',
                  background:     uploading ? 'var(--text-muted)' : 'var(--accent)',
                  color:          '#fff',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  border:         '2px solid var(--bg-card)',
                  zIndex:         3,
                  pointerEvents:  'none',
                }}
              >
                {uploading ? (
                  <div
                    style={{
                      width:          10,
                      height:         10,
                      border:         '2px solid rgba(255,255,255,0.35)',
                      borderTopColor: '#fff',
                      borderRadius:   '50%',
                      animation:      'spin 0.65s linear infinite',
                    }}
                  />
                ) : (
                  <FiPlus size={12} strokeWidth={3} />
                )}
              </div>
            </div>

            <span
              style={{
                fontSize:     '0.72rem',
                color:        showMenu ? 'var(--accent)' : 'var(--text-secondary)',
                maxWidth:     68,
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
                fontWeight:   myStories.length > 0 ? 700 : 400,
                textAlign:    'center',
                transition:   'color 0.15s',
              }}
            >
              {uploading ? 'Uploading…' : 'Your story'}
            </span>
          </motion.div>

          {/* ── OTHER USERS ────────────────────────────────────────── */}
          {storyUsers.map((u) => (
            <StoryCircle
              key={u._id}
              user={u}
              story={
                (u.stories || []).find(
                  (s) => s.image && new Date(s.expiresAt) > new Date()
                ) || null
              }
            />
          ))}

          {storyUsers.length === 0 && (
            <div
              style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '0 1rem',
                opacity:        0.45,
                alignSelf:      'center',
              }}
            >
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Follow people to see their stories
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* ── MENU PORTAL — renders on body, never clipped ─────────── */}
      {showMenu && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMenu(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 8888 }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: -4 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.88, y: -4  }}
            transition={{ duration: 0.15 }}
            style={{
              position:     'fixed',
              top:          menuPos.top,
              left:         menuPos.left,
              transform:    'translateX(-50%)',
              zIndex:       9999,
              background:   'var(--bg-card)',
              border:       '1px solid var(--border)',
              borderRadius: '16px',
              boxShadow:    '0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
              minWidth:     200,
              overflow:     'hidden',
            }}
          >
            {/* Arrow tip */}
            <div
              style={{
                position:     'absolute',
                top:          -7,
                left:         '50%',
                transform:    'translateX(-50%) rotate(45deg)',
                width:        13,
                height:       13,
                background:   'var(--bg-card)',
                border:       '1px solid var(--border)',
                borderBottom: 'none',
                borderRight:  'none',
                borderRadius: '2px 0 0 0',
              }}
            />

            {/* View Story */}
            {myStories.length > 0 && (
              <MenuBtn
                icon={<FiEye size={15} />}
                label={`View Story (${myStories.length})`}
                onClick={() => {
                  setShowMenu(false);
                  setViewingOwn(true);
                }}
              />
            )}

            {/* Add Story */}
            <MenuBtn
              icon={<FiCamera size={15} />}
              label="Add New Story"
              onClick={() => {
                setShowMenu(false);
                fileRef.current?.click();
              }}
            />

            <div style={{ height: 1, background: 'var(--border)', margin: '0 0.75rem' }} />

            {/* Cancel */}
            <MenuBtn
              icon={<FiX size={15} />}
              label="Cancel"
              onClick={() => setShowMenu(false)}
              muted
            />
          </motion.div>
        </>,
        document.body
      )}

      {/* ── OWN STORY VIEWER PORTAL ──────────────────────────────── */}
      {viewingOwn && createPortal(
        <OwnStoryViewer
          stories={myStories}
          onClose={() => setViewingOwn(false)}
          username={user?.username}
          avatar={user?.profilePicture}
        />,
        document.body
      )}
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   MenuBtn
───────────────────────────────────────────────────────────────────────── */
const MenuBtn = ({ icon, label, onClick, muted = false }) => (
  <button
    onClick={onClick}
    style={{
      display:    'flex',
      alignItems: 'center',
      gap:        '0.65rem',
      width:      '100%',
      padding:    '0.75rem 1rem',
      background: 'none',
      border:     'none',
      cursor:     'pointer',
      color:      muted ? 'var(--text-muted)' : 'var(--text-secondary)',
      fontSize:   '0.875rem',
      fontWeight: 500,
      fontFamily: 'inherit',
      textAlign:  'left',
      transition: 'background 0.15s, color 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--bg-hover)';
      e.currentTarget.style.color      = muted ? 'var(--text-secondary)' : 'var(--text-primary)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'none';
      e.currentTarget.style.color      = muted ? 'var(--text-muted)' : 'var(--text-secondary)';
    }}
  >
    <span style={{ color: muted ? 'var(--text-muted)' : 'var(--accent)', display: 'flex' }}>
      {icon}
    </span>
    {label}
  </button>
);

/* ─────────────────────────────────────────────────────────────────────────
   OwnStoryViewer
───────────────────────────────────────────────────────────────────────── */

// ✅ Color palette matching your Avatar.jsx
const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f97316',
  '#10b981','#3b82f6','#ef4444','#f59e0b',
];

const getAvatarColor = (username = '') =>
  AVATAR_COLORS[username.charCodeAt(0) % AVATAR_COLORS.length];

const getInitials = (username = '') =>
  username.slice(0, 2).toUpperCase() || '??';

const OwnStoryViewer = ({ stories, onClose, username, avatar }) => {
  const [idx,    setIdx]    = useState(0);
  const [paused, setPaused] = useState(false);

  const current = stories[idx];
  const goNext  = () => idx < stories.length - 1 ? setIdx(idx + 1) : onClose();
  const goPrev  = () => idx > 0 ? setIdx(idx - 1) : null;

  useEffect(() => { setPaused(false); }, [idx]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{   opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(0,0,0,0.92)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         99999,
        padding:        '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1,    opacity: 1 }}
        exit={{   scale: 0.88, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          position:     'relative',
          width:        '100%',
          maxWidth:     420,
          borderRadius: 24,
          overflow:     'hidden',
          background:   '#111',
          boxShadow:    '0 30px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* ── Progress bars ── */}
        <div
          style={{
            position: 'absolute',
            top:      10,
            left:     12,
            right:    12,
            display:  'flex',
            gap:      4,
            zIndex:   20,
          }}
        >
          {stories.map((_, i) => (
            <div
              key={i}
              style={{
                flex:         1,
                height:       3,
                borderRadius: 99,
                background:   'rgba(255,255,255,0.3)',
                overflow:     'hidden',
              }}
            >
              {i < idx && (
                <div style={{ width: '100%', height: '100%', background: '#fff' }} />
              )}
              {i === idx && (
                <motion.div
                  key={`seg-${idx}`}
                  initial={{ width: '0%' }}
                  animate={{ width: paused ? undefined : '100%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  onAnimationComplete={goNext}
                  style={{ height: '100%', background: '#fff', borderRadius: 99 }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── Header ── */}
        <div
          style={{
            position:       'absolute',
            top:            22,
            left:           12,
            right:          12,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            zIndex:         20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>

            {/* ✅ Avatar — shows profile photo OR coloured initials (matches Avatar.jsx) */}
            <div
              style={{
                width:          40,
                height:         40,
                borderRadius:   '50%',
                overflow:       'hidden',
                border:         '2px solid rgba(255,255,255,0.85)',
                flexShrink:     0,
                background:     getAvatarColor(username),
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          '#fff',
                fontWeight:     700,
                fontSize:       '0.9rem',
              }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    // ✅ If image fails, hide it and show initials underneath
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span>{getInitials(username)}</span>
              )}
            </div>

            <div>
              <p style={{
                color:      '#fff',
                fontWeight: 700,
                fontSize:   '0.9rem',
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                lineHeight: 1.2,
              }}>
                {username}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>
                {idx + 1} / {stories.length}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              width:          34,
              height:         34,
              borderRadius:   '50%',
              background:     'rgba(0,0,0,0.5)',
              border:         '1px solid rgba(255,255,255,0.15)',
              color:          '#fff',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
            }}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* ── Story image ── */}
        {current?.image ? (
          <img
            key={current.image}
            src={current.image}
            alt="story"
            draggable={false}
            onMouseDown={()  => setPaused(true)}
            onMouseUp={()    => setPaused(false)}
            onTouchStart={()  => setPaused(true)}
            onTouchEnd={()    => setPaused(false)}
            onError={(e) => {
              e.currentTarget.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="420" height="560"><rect width="420" height="560" fill="%23222"/><text x="50%25" y="50%25" fill="%23888" text-anchor="middle" font-size="16" dy=".3em">Image unavailable</text></svg>';
            }}
            style={{
              width:      '100%',
              minHeight:  520,
              maxHeight:  '80vh',
              objectFit:  'cover',
              display:    'block',
              userSelect: 'none',
            }}
          />
        ) : (
          /* ✅ No image fallback — gradient with initials */
          <div
            style={{
              width:          '100%',
              height:         560,
              background:     `linear-gradient(135deg, ${getAvatarColor(username)}, #ec4899)`,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '1rem',
            }}
          >
            <div
              style={{
                width:          80,
                height:         80,
                borderRadius:   '50%',
                background:     'rgba(255,255,255,0.2)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '2rem',
                fontWeight:     800,
                color:          '#fff',
              }}
            >
              {getInitials(username)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              No image available
            </p>
          </div>
        )}

        {/* ── Tap zones ── */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 10 }}>
          <div
            style={{ flex: 1, cursor: idx > 0 ? 'pointer' : 'default' }}
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
          />
          <div
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); goNext(); }}
          />
        </div>

        {/* ── Prev arrow ── */}
        {idx > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            style={{
              position:       'absolute',
              left:           10,
              top:            '50%',
              transform:      'translateY(-50%)',
              width:          36,
              height:         36,
              borderRadius:   '50%',
              background:     'rgba(0,0,0,0.5)',
              border:         '1px solid rgba(255,255,255,0.15)',
              color:          '#fff',
              fontSize:       22,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              zIndex:         15,
            }}
          >‹</button>
        )}

        {/* ── Next arrow ── */}
        {idx < stories.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            style={{
              position:       'absolute',
              right:          10,
              top:            '50%',
              transform:      'translateY(-50%)',
              width:          36,
              height:         36,
              borderRadius:   '50%',
              background:     'rgba(0,0,0,0.5)',
              border:         '1px solid rgba(255,255,255,0.15)',
              color:          '#fff',
              fontSize:       22,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              zIndex:         15,
            }}
          >›</button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StoryRow;