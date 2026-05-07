//frontend/src/components/layout/MobileNav.jsx
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiHome, FiSearch, FiBell, FiMessageCircle, FiUser } from 'react-icons/fi';

const MobileNav = () => {
  const { user }        = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);

  const links = [
    { to: '/',              icon: <FiHome size={22} />,          end: true },
    { to: '/search',        icon: <FiSearch size={22} /> },
    { to: '/notifications', icon: <FiBell size={22} />,          badge: unreadCount },
    { to: '/chat',          icon: <FiMessageCircle size={22} /> },
    { to: `/profile/${user?.username}`, icon: <FiUser size={22} /> },
  ];

  return (
    <nav
      className="mobile-nav"
      style={{
        display:        'none',   /* shown via CSS media query */
        position:       'fixed',
        bottom:         0,
        left:           0,
        right:          0,
        height:         '60px',
        background:     'var(--bg-card)',
        borderTop:      '1px solid var(--border)',
        zIndex:         1000,
        justifyContent: 'space-around',
        alignItems:     'center',
        padding:        '0 0.5rem',
        transition:     'background 0.3s, border-color 0.3s',
      }}
    >
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          style={({ isActive }) => ({
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            padding:       '0.5rem',
            color:         isActive ? 'var(--accent)' : 'var(--text-secondary)',
            position:      'relative',
            transition:    'color 0.15s',
          })}
        >
          {link.icon}
          {link.badge > 0 && (
            <span
              style={{
                position:       'absolute',
                top:            2,
                right:          2,
                background:     '#ef4444',
                color:          '#fff',
                borderRadius:   '50%',
                width:          16,
                height:         16,
                fontSize:       '0.62rem',
                fontWeight:     700,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}
            >
              {link.badge > 9 ? '9+' : link.badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;