//frontend/src/pages/Search.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUserPlus, FiUserCheck } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axios';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { updateFollowing } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Search = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const { data } = await api.get('/users/suggestions');
        setSuggestions(data.users);
      } catch { /* silent */ }
    };
    fetchSuggestions();
  }, []);

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) { setUsers([]); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(q)}`);
      setUsers(data.users);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleFollow = async (userId) => {
    setFollowLoading((p) => ({ ...p, [userId]: true }));
    try {
      const { data } = await api.put(`/users/${userId}/follow`);
      dispatch(updateFollowing({ userId, action: data.action }));
      const update = (list) =>
        list.map((u) =>
          u._id === userId
            ? { ...u, _followed: data.action === 'followed', followers: data.action === 'followed' ? [...(u.followers || []), currentUser._id] : (u.followers || []).filter((id) => id !== currentUser._id) }
            : u
        );
      setUsers((p) => update(p));
      setSuggestions((p) => update(p));
      toast.success(data.action === 'followed' ? 'Following!' : 'Unfollowed');
    } catch {
      toast.error('Failed');
    } finally {
      setFollowLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const displayUsers = query.trim() ? users : suggestions;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.75rem 1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <FiSearch size={18} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users by name or bio..."
            autoFocus
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
            }}
          />
          {loading && (
            <div
              style={{
                width: 16,
                height: 16,
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Section header */}
      <h3
        style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '0.875rem',
        }}
      >
        {query.trim() ? `Results for "${query}"` : 'Suggested for you'}
      </h3>

      {/* Results */}
      <AnimatePresence mode="wait">
        {displayUsers.length === 0 && query.trim() && !loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
            style={{ padding: '3rem', textAlign: 'center' }}
          >
            <FiSearch size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>No users found for &quot;{query}&quot;</p>
          </motion.div>
        ) : (
          <motion.div className="card" style={{ overflow: 'hidden' }}>
            {displayUsers.map((u, i) => {
              const isFollowingUser =
                u._followed ||
                currentUser?.following?.some(
                  (id) => id?.toString() === u._id?.toString()
                );
              const isCurrentUser = u._id === currentUser?._id;

              return (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.875rem 1.25rem',
                    borderBottom: i < displayUsers.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => navigate(`/profile/${u.username}`)}
                >
                  <Avatar src={u.profilePicture} size={48} username={u.username} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {u.username}
                      </p>
                      {u.isVerified && (
                        <span style={{ color: 'var(--accent)', fontSize: '0.75rem' }}>✓</span>
                      )}
                    </div>
                    {u.bio && (
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {u.bio}
                      </p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {u.followers?.length || 0} followers
                    </p>
                  </div>

                  {!isCurrentUser && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant={isFollowingUser ? 'ghost' : 'primary'}
                        loading={followLoading[u._id]}
                        onClick={() => handleFollow(u._id)}
                        icon={isFollowingUser ? <FiUserCheck size={13} /> : <FiUserPlus size={13} />}
                      >
                        {isFollowingUser ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;