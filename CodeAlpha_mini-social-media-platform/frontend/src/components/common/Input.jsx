//frontend/src/components/common/Input.jsx
import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  required = false,
  name,
  autoComplete,
  maxLength,
  style = {},
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: '1rem', width: '100%', ...style }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.4rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </span>
        )}
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          style={{
            width: '100%',
            padding: `0.75rem ${isPassword ? '2.75rem' : '1rem'} 0.75rem ${icon ? '2.75rem' : '1rem'}`,
            background: 'var(--bg-input)',
            border: `1.5px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--accent)';
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239,68,68,0.1)' : 'var(--accent-light)'}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            style={{
              position: 'absolute',
              right: '0.875rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p style={{ marginTop: '0.3rem', fontSize: '0.78rem', color: 'var(--error)' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;