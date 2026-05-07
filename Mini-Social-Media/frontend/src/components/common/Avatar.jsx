//frontend/src/components/common/Avatar.jsx
import { useState } from 'react';

const COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f97316',
  '#10b981','#3b82f6','#ef4444','#f59e0b',
];

const Avatar = ({
  src,
  size     = 40,
  username = '',
  onClick,
  style    = {},
}) => {
  const [imgError, setImgError] = useState(false);

  const initials   = username ? username.slice(0, 2).toUpperCase() : '??';
  const colorIndex = username ? username.charCodeAt(0) % COLORS.length : 0;

  return (
    <div
      onClick={onClick}
      style={{
        width:          size,
        height:         size,
        borderRadius:   '50%',
        overflow:       'hidden',
        flexShrink:     0,
        cursor:         onClick ? 'pointer' : 'default',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     COLORS[colorIndex],
        fontSize:       size * 0.35,
        fontWeight:     700,
        color:          '#fff',
        userSelect:     'none',
        ...style,
      }}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={username}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;