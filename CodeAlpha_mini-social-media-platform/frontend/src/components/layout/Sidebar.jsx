//frontend/src/components/layout/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiHome, FiSearch, FiBell,
  FiMessageCircle, FiBookmark, FiUser,
} from 'react-icons/fi';
import Avatar from '../common/Avatar';

const Sidebar = () => {
  const { user }        = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);

  const links = [
    { to: '/',              icon: <FiHome size={20} />,          label: 'Home',          end: true },
    { to: '/search',        icon: <FiSearch size={20} />,        label: 'Explore' },
    { to: '/notifications', icon: <FiBell size={20} />,          label: 'Notifications', badge: unreadCount },
    { to: '/chat',          icon: <FiMessageCircle size={20} />, label: 'Messages' },
    { to: '/saved',         icon: <FiBookmark size={20} />,      label: 'Saved' },
    { to: `/profile/${user?.username}`, icon: <FiUser size={20} />, label: 'Profile' },
  ];

  return (
    <aside
      className="sidebar-container"
      style={{
        position:      'fixed',
        top:           'var(--navbar-height)',
        left:          0,
        width:         'var(--sidebar-width)',
        height:        'calc(100vh - var(--navbar-height))',
        background:    'var(--bg-card)',
        borderRight:   '1px solid var(--border)',
        padding:       '1.25rem 0.875rem',
        display:       'flex',
        flexDirection: 'column',
        gap:           '0.2rem',
        overflowY:     'auto',
        zIndex:        900,
        transition:    'background 0.3s, border-color 0.3s',
      }}
    >
      {/* Mini profile card */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '0.75rem',
          padding:      '0.75rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1rem',
          background:   'var(--bg-secondary)',
          border:       '1px solid var(--border)',
          transition:   'background 0.3s, border-color 0.3s',
        }}
      >
        <Avatar src={user?.profilePicture} size={38} username={user?.username} />
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            style={{
              fontWeight:    700,
              fontSize:      '0.875rem',
              color:         'var(--text-primary)',
              overflow:      'hidden',
              textOverflow:  'ellipsis',
              whiteSpace:    'nowrap',
            }}
          >
            {user?.username}
          </div>
          <div
            style={{
              fontSize:     '0.75rem',
              color:        'var(--text-muted)',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}
          >
            {user?.bio || 'No bio yet'}
          </div>
        </div>
      </div>

      {/* Nav links */}
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          style={({ isActive }) => ({
            display:        'flex',
            alignItems:     'center',
            gap:            '0.875rem',
            padding:        '0.7rem 0.875rem',
            borderRadius:   'var(--radius-md)',
            color:          isActive ? 'var(--accent)'       : 'var(--text-secondary)',
            background:     isActive ? 'var(--accent-light)' : 'transparent',
            fontWeight:     isActive ? 700                    : 500,
            fontSize:       '0.875rem',
            transition:     'all 0.15s',
            position:       'relative',
            textDecoration: 'none',
          })}
        >
          {link.icon}
          <span style={{ flex: 1 }}>{link.label}</span>
          {link.badge > 0 && (
            <span
              style={{
                background:     '#ef4444',
                color:          '#fff',
                borderRadius:   'var(--radius-full)',
                fontSize:       '0.7rem',
                fontWeight:     700,
                minWidth:       18,
                height:         18,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                padding:        '0 4px',
              }}
            >
              {link.badge > 9 ? '9+' : link.badge}
            </span>
          )}
        </NavLink>
      ))}
    </aside>
  );
};

export default Sidebar;