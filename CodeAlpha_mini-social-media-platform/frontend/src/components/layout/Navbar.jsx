//frontend/src/components/layout/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiSearch, FiBell, FiMessageCircle,
  FiSun, FiMoon, FiLogOut, FiUser, FiBookmark, FiEdit3,
} from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import CreatePostModal from '../common/CreatePostModal';

const Navbar = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { toggleTheme, isDark } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreate,   setShowCreate]   = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <nav
        className="navbar-container"
        style={{
          position:       'fixed',
          top:            0,
          left:           0,
          right:          0,
          height:         'var(--navbar-height)',
          background:     'var(--bg-card)',
          borderBottom:   '1px solid var(--border)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '0 1.5rem',
          zIndex:         1000,
          backdropFilter: 'blur(12px)',
          boxShadow:      'var(--shadow-sm)',
        }}
      >
        {/* ── Logo ── */}
        <Link
          to="/"
          style={{
            fontSize:                '1.5rem',
            fontWeight:              900,
            background:              'linear-gradient(135deg, #6366f1, #ec4899)',
            WebkitBackgroundClip:    'text',
            WebkitTextFillColor:     'transparent',
            backgroundClip:          'text',
            letterSpacing:           '-0.5px',
            flexShrink:              0,
          }}
        >
          SocialSphere
        </Link>

        {/* ── Search bar ── */}
        <button
          onClick={() => navigate('/search')}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '0.5rem',
            padding:      '0.5rem 1.25rem',
            background:   'var(--bg-input)',
            border:       '1.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            color:        'var(--text-muted)',
            fontSize:     '0.875rem',
            cursor:       'pointer',
            width:        '220px',
            transition:   'all 0.2s',
            fontFamily:   'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <FiSearch size={14} />
          Search people...
        </button>

        {/* ── Right icons ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <NavIconLink to="/"    icon={<FiHome size={20} />}          title="Home" />

          {/* Create post */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowCreate(true)}
            title="Create Post"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          38,
              height:         38,
              borderRadius:   'var(--radius-md)',
              color:          'var(--text-secondary)',
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              transition:     'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color      = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color      = 'var(--text-secondary)';
            }}
          >
            <FiEdit3 size={20} />
          </motion.button>

          {/* Notifications */}
          <Link
            to="/notifications"
            title="Notifications"
            style={{
              position:       'relative',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          38,
              height:         38,
              borderRadius:   'var(--radius-md)',
              color:          'var(--text-secondary)',
              transition:     'background 0.15s',
            }}
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position:       'absolute',
                  top:            4,
                  right:          4,
                  width:          16,
                  height:         16,
                  background:     '#ef4444',
                  borderRadius:   '50%',
                  fontSize:       '0.6rem',
                  fontWeight:     700,
                  color:          '#fff',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  border:         '2px solid var(--bg-card)',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </Link>

          <NavIconLink to="/chat" icon={<FiMessageCircle size={20} />} title="Messages" />

          {/* Theme toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            title="Toggle theme"
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              width:          38,
              height:         38,
              borderRadius:   'var(--radius-md)',
              color:          'var(--text-secondary)',
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              transition:     'background 0.15s',
            }}
          >
            {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </motion.button>

          {/* Profile dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowDropdown((p) => !p)}
              style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
            >
              <Avatar src={user?.profilePicture} size={36} username={user?.username} />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{   opacity: 0, y: -8, scale: 0.95  }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position:     'absolute',
                    top:          'calc(100% + 8px)',
                    right:        0,
                    width:        200,
                    background:   'var(--bg-card)',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow:    'var(--shadow-xl)',
                    overflow:     'hidden',
                    zIndex:       100,
                  }}
                >
                  {[
                    { icon: <FiUser size={15} />,     label: 'Profile',    to: `/profile/${user?.username}` },
                    { icon: <FiBookmark size={15} />, label: 'Saved Posts', to: '/saved' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setShowDropdown(false)}
                      style={{
                        display:    'flex',
                        alignItems: 'center',
                        gap:        '0.75rem',
                        padding:    '0.75rem 1rem',
                        color:      'var(--text-secondary)',
                        fontSize:   '0.875rem',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-hover)';
                        e.currentTarget.style.color      = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color      = 'var(--text-secondary)';
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <div style={{ borderTop: '1px solid var(--border)' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width:      '100%',
                      display:    'flex',
                      alignItems: 'center',
                      gap:        '0.75rem',
                      padding:    '0.75rem 1rem',
                      color:      'var(--error)',
                      fontSize:   '0.875rem',
                      background: 'none',
                      border:     'none',
                      cursor:     'pointer',
                      fontFamily: 'inherit',
                      textAlign:  'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <FiLogOut size={15} />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </>
  );
};

/* ── NavIconLink helper ──────────────────────────────────────────────── */
const NavIconLink = ({ to, icon, title }) => (
  <Link
    to={to}
    title={title}
    style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      width:          38,
      height:         38,
      borderRadius:   'var(--radius-md)',
      color:          'var(--text-secondary)',
      transition:     'background 0.15s, color 0.15s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--bg-hover)';
      e.currentTarget.style.color      = 'var(--accent)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color      = 'var(--text-secondary)';
    }}
  >
    {icon}
  </Link>
);

export default Navbar;