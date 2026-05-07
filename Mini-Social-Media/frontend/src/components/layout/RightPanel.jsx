//frontend/src/components/layout/RightPanel.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../api/axios';
import Avatar from '../common/Avatar';
import toast from 'react-hot-toast';
import { updateFollowing } from '../../redux/slices/authSlice';

const RightPanel = () => {
  const { user }   = useSelector((s) => s.auth);
  const dispatch   = useDispatch();
  const [suggestions,   setSuggestions]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await api.get('/users/suggestions');
        setSuggestions(data.users);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetchSuggestions();
  }, []);

  const handleFollow = async (userId) => {
    setFollowLoading((p) => ({ ...p, [userId]: true }));
    try {
      const { data } = await api.put(`/users/${userId}/follow`);
      dispatch(updateFollowing({ userId, action: data.action }));
      setSuggestions((prev) =>
        data.action === 'followed'
          ? prev.map((u) => (u._id === userId ? { ...u, _followed: true } : u))
          : prev.filter((u) => u._id !== userId)
      );
      toast.success(data.action === 'followed' ? 'Following!' : 'Unfollowed');
    } catch {
      toast.error('Action failed');
    } finally {
      setFollowLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  return (
    <aside
      className="right-panel-container"
      style={{
        position:   'fixed',
        top:        'var(--navbar-height)',
        right:      0,
        width:      'var(--right-panel-width)',
        height:     'calc(100vh - var(--navbar-height))',
        padding:    '1.5rem 1rem',
        overflowY:  'auto',
        zIndex:     900,
        transition: 'width 0.3s',
      }}
    >
      {/* Current user info */}
      <div
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '0.875rem',
          marginBottom: '1.5rem',
        }}
      >
        <Link to={`/profile/${user?.username}`}>
          <Avatar src={user?.profilePicture} size={44} username={user?.username} />
        </Link>
        <div>
          <Link
            to={`/profile/${user?.username}`}
            style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}
          >
            {user?.username}
          </Link>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {user?.bio?.slice(0, 30) || 'Your profile'}
          </p>
        </div>
      </div>

      {/* Suggested users */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Suggested for you
          </h4>
          <Link to="/search" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
            See All
          </Link>
        </div>

        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 6 }} />
                  <div className="skeleton" style={{ height: 10, width: '40%' }} />
                </div>
                <div className="skeleton" style={{ height: 28, width: 68, borderRadius: 99 }} />
              </div>
            ))
          : suggestions.map((suggestedUser) => {
              const isFollowing = suggestedUser._followed ||
                user?.following?.some((id) => id?.toString() === suggestedUser._id?.toString());
              return (
                <div
                  key={suggestedUser._id}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}
                >
                  <Link to={`/profile/${suggestedUser.username}`}>
                    <Avatar src={suggestedUser.profilePicture} size={38} username={suggestedUser.username} />
                  </Link>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Link
                      to={`/profile/${suggestedUser.username}`}
                      style={{
                        fontWeight:   600, fontSize: '0.85rem', color: 'var(--text-primary)',
                        display:      'block', overflow: 'hidden',
                        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {suggestedUser.username}
                    </Link>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {suggestedUser.followers?.length || 0} followers
                    </span>
                  </div>
                  <button
                    onClick={() => handleFollow(suggestedUser._id)}
                    disabled={followLoading[suggestedUser._id] || isFollowing}
                    style={{
                      padding:      '0.3rem 0.875rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize:     '0.78rem',
                      fontWeight:   600,
                      background:   isFollowing ? 'var(--bg-tertiary)' : 'var(--accent)',
                      color:        isFollowing ? 'var(--text-secondary)' : '#fff',
                      border:       'none',
                      cursor:       followLoading[suggestedUser._id] ? 'wait' : 'pointer',
                      transition:   'all 0.2s',
                      opacity:      followLoading[suggestedUser._id] ? 0.6 : 1,
                      fontFamily:   'inherit',
                    }}
                  >
                    {followLoading[suggestedUser._id] ? '...' : isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
      </div>

      {/* Footer */}
      <div style={{ marginTop: '2rem', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 2 }}>
        <p>© 2024 SocialSphere</p>
        <p>About · Help · Privacy · Terms</p>
      </div>
    </aside>
  );
};

export default RightPanel;