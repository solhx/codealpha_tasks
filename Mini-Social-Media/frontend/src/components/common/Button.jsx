//frontend/src/components/common/Button.jsx
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  icon,
  style = {},
}) => {
  const sizes = {
    sm: { padding: '0.4rem 1rem', fontSize: '0.8rem' },
    md: { padding: '0.65rem 1.4rem', fontSize: '0.875rem' },
    lg: { padding: '0.875rem 2rem', fontSize: '1rem' },
  };

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: 'var(--accent)',
      border: '2px solid var(--accent)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border)',
    },
    danger: {
      background: 'var(--error)',
      color: '#fff',
      border: 'none',
    },
    success: {
      background: 'var(--success)',
      color: '#fff',
      border: 'none',
    },
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background 0.2s, box-shadow 0.2s',
        width: fullWidth ? '100%' : 'auto',
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
    >
      {loading ? (
        <ClipLoader size={14} color={variant === 'primary' || variant === 'danger' ? '#fff' : 'var(--accent)'} />
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;