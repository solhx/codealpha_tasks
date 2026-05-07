//frontend/src/components/common/Loader.jsx
import { ClipLoader, BeatLoader } from 'react-spinners';

const Loader = ({ size = 'md', type = 'clip', fullScreen = false, text = '' }) => {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] || 36;

  const spinner =
    type === 'beat' ? (
      <BeatLoader size={10} color="var(--accent)" />
    ) : (
      <ClipLoader size={px} color="var(--accent)" />
    );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          zIndex: 9999,
          gap: '1rem',
        }}
      >
        {spinner}
        {text && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '0.75rem',
      }}
    >
      {spinner}
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{text}</p>}
    </div>
  );
};

export default Loader;