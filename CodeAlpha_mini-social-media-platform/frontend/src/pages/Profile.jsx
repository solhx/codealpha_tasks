//frontend/src/pages/Profile.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit3, FiGrid, FiList, FiLink,
  FiMapPin, FiCalendar, FiUserPlus, FiUserCheck,
  FiMessageCircle,
} from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../api/axios';
import { updateFollowing, updateProfile } from '../redux/slices/authSlice';
import PostCard from '../components/common/PostCard';
import Avatar from '../components/common/Avatar';
import StoryRing from '../components/common/StoryRing';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────
   EditProfileModal — defined OUTSIDE Profile to avoid remount on re-render
───────────────────────────────────────────────────────────────────────── */
const EditProfileModal = ({ isOpen, onClose, profile, onUpdated }) => {
  const dispatch    = useDispatch();
  const { loading } = useSelector((s) => s.auth);
  const profileRef  = useRef();
  const coverRef    = useRef();

  const [form, setForm] = useState({
    username: profile?.username || '',
    bio:      profile?.bio      || '',
    website:  profile?.website  || '',
    location: profile?.location || '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [coverPic,   setCoverPic]   = useState(null);

  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || '',
        bio:      profile.bio      || '',
        website:  profile.website  || '',
        location: profile.location || '',
      });
    }
  }, [profile]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (profilePic) fd.append('profilePicture', profilePic);
    if (coverPic)   fd.append('coverPhoto', coverPic);
    const result = await dispatch(updateProfile(fd));
    if (!result.error) {
      onUpdated(result.payload);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
      <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.5rem' }}>
        {/* Profile picture */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <Avatar src={profile?.profilePicture} size={64} username={profile?.username} />
          <div>
            <input
              type="file" accept="image/*" ref={profileRef}
              onChange={(e) => setProfilePic(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <Button type="button" variant="outline" size="sm"
              onClick={() => profileRef.current?.click()}>
              Change Photo
            </Button>
            {profilePic && (
              <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: 4 }}>
                {profilePic.name}
              </p>
            )}
          </div>
        </div>

        {/* Cover photo */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="file" accept="image/*" ref={coverRef}
            onChange={(e) => setCoverPic(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <Button type="button" variant="ghost" size="sm"
            onClick={() => coverRef.current?.click()}>
            {coverPic ? `Cover: ${coverPic.name}` : 'Change Cover Photo'}
          </Button>
        </div>

        <Input
          label="Username" name="username"
          value={form.username} onChange={handleChange} required
        />

        {/* Bio */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block', marginBottom: '0.4rem',
            fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)',
          }}>
            Bio
          </label>
          <textarea
            name="bio" value={form.bio} onChange={handleChange}
            rows={3} maxLength={160} placeholder="Tell the world about yourself..."
            style={{
              width: '100%', padding: '0.75rem 1rem',
              background: 'var(--bg-input)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
              fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'inherit',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e)  => (e.target.style.borderColor = 'var(--border)')}
          />
          <p style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {form.bio.length}/160
          </p>
        </div>

        <Input label="Website"  name="website"  value={form.website}
          onChange={handleChange} placeholder="https://yoursite.com" />
        <Input label="Location" name="location" value={form.location}
          onChange={handleChange} placeholder="City, Country" />

        <Button type="submit" fullWidth loading={loading}>
          Save Changes
        </Button>
      </form>
    </Modal>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   Profile Page
───────────────────────────────────────────────────────────────────────── */
const Profile = () => {
  const { username }  = useParams();
  const navigate      = useNavigate();
  const dispatch      = useDispatch();
  const { user: currentUser } = useSelector((s) => s.auth);

  const [profile,         setProfile]         = useState(null);
  const [posts,           setPosts]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [followLoading,   setFollowLoading]   = useState(false);
  const [viewMode,        setViewMode]        = useState('grid');
  const [activeTab,       setActiveTab]       = useState('posts');
  const [showEditModal,   setShowEditModal]   = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers');
  const [error,           setError]           = useState(null);

  const isOwnProfile = currentUser?.username === username;
  const isFollowing  = currentUser?.following?.some(
    (id) => id?.toString() === profile?._id?.toString()
  );

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/users/${username}`);
        if (!cancelled) {
          setProfile(data.user);
          setPosts(data.posts || []);
        }
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) navigate('/');
          else {
            setError('Failed to load profile. Please try again.');
            toast.error('Failed to load profile');
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => { cancelled = true; };
  }, [username, navigate]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const { data } = await api.put(`/users/${profile._id}/follow`);
      dispatch(updateFollowing({ userId: profile._id, action: data.action }));
      setProfile((prev) => ({
        ...prev,
        followers:
          data.action === 'followed'
            ? [...prev.followers, {
                _id: currentUser._id,
                username: currentUser.username,
                profilePicture: currentUser.profilePicture,
              }]
            : prev.followers.filter(
                (f) => f._id?.toString() !== currentUser._id?.toString()
              ),
      }));
      toast.success(
        data.action === 'followed'
          ? `Following ${profile.username}`
          : `Unfollowed ${profile.username}`
      );
    } catch {
      toast.error('Action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <Loader fullScreen text="Loading profile..." />;
  if (error)   return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
  if (!profile) return null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>

      {/* ── Cover + Card wrapper ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ position: 'relative', marginBottom: '1rem' }}
      >
        {/* Cover photo */}
        <div
          style={{
            height:       '220px',
            background:   profile.coverPhoto
              ? `url(${profile.coverPhoto}) center/cover no-repeat`
              : 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #8b5cf6 100%)',
            borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
            overflow:     'hidden',
          }}
        />

        {/* Profile info card */}
        <div
          className="card"
          style={{
            borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
            padding:      '0 1.5rem 1.5rem',
            borderTop:    'none',
          }}
        >
          {/* ── Avatar row ── */}
          <div
            style={{
              display:        'flex',
              alignItems:     'flex-end',
              justifyContent: 'space-between',
              marginTop:      '-47px',
              paddingBottom:  '1rem',
            }}
          >
            {/* Avatar with story ring */}
            <div
              style={{
                background:   'var(--bg-card)',
                borderRadius: '50%',
                padding:      3,
                flexShrink:   0,
                position:     'relative',
                zIndex:       2,
                boxShadow:    'var(--shadow-md)',
              }}
            >
              <StoryRing size={94} hasStory={profile.stories?.length > 0}>
                <Avatar
                  src={profile.profilePicture}
                  size={84}
                  username={profile.username}
                />
              </StoryRing>
            </div>

            {/* Action buttons */}
            <div
              style={{
                display:      'flex',
                gap:          '0.5rem',
                alignSelf:    'flex-end',
                paddingBottom:'0.25rem',
              }}
            >
              {isOwnProfile ? (
                <Button
                  variant="outline" size="sm"
                  onClick={() => setShowEditModal(true)}
                  icon={<FiEdit3 size={14} />}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant={isFollowing ? 'ghost' : 'primary'}
                    size="sm"
                    loading={followLoading}
                    onClick={handleFollow}
                    icon={isFollowing ? <FiUserCheck size={14} /> : <FiUserPlus size={14} />}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    onClick={() => navigate('/chat')}
                    icon={<FiMessageCircle size={14} />}
                  >
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ── Username + Bio + Meta ── */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {profile.username}
              </h2>
              {profile.isVerified && (
                <span style={{
                  background: 'var(--accent)', color: '#fff',
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700,
                }}>
                  ✓
                </span>
              )}
            </div>

            {profile.bio && (
              <p style={{
                color: 'var(--text-secondary)', fontSize: '0.9rem',
                lineHeight: 1.6, marginBottom: '0.75rem',
              }}>
                {profile.bio}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--accent)' }}
                >
                  <FiLink size={13} />
                  {profile.website.replace(/https?:\/\//, '')}
                </a>
              )}
              {profile.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <FiMapPin size={13} /> {profile.location}
                </span>
              )}
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <FiCalendar size={13} />
                Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}
              </span>
            </div>
          </div>

          {/* ── Stats ── */}
          <div style={{
            display:    'flex',
            gap:        0,
            borderTop:  '1px solid var(--border)',
            paddingTop: '1rem',
          }}>
            {[
              { label: 'Posts',     value: posts.length,               onClick: null },
              { label: 'Followers', value: profile.followers?.length || 0, onClick: () => { setFollowModalType('followers'); setShowFollowModal(true); } },
              { label: 'Following', value: profile.following?.length || 0, onClick: () => { setFollowModalType('following'); setShowFollowModal(true); } },
            ].map((stat, i) => (
              <div
                key={stat.label}
                onClick={stat.onClick}
                style={{
                  flex:          1,
                  textAlign:     'center',
                  cursor:        stat.onClick ? 'pointer' : 'default',
                  borderRight:   i < 2 ? '1px solid var(--border)' : 'none',
                  padding:       '0.25rem 0',
                  borderRadius:  'var(--radius-sm)',
                  transition:    'background 0.15s',
                }}
                onMouseEnter={(e) => stat.onClick && (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => stat.onClick && (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div
        className="card"
        style={{
          display:      'flex',
          alignItems:   'center',
          padding:      '0 1rem',
          marginBottom: '1rem',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {['posts', 'saved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding:       '0.875rem 1.25rem',
              fontWeight:    600,
              fontSize:      '0.875rem',
              color:         activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              /* ✅ No duplicate key — using individual border properties */
              borderTop:     'none',
              borderLeft:    'none',
              borderRight:   'none',
              borderBottom:  activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              background:    'none',
              cursor:        'pointer',
              transition:    'all 0.2s',
              textTransform: 'capitalize',
              fontFamily:    'inherit',
              outline:       'none',
            }}
          >
            {tab}
          </button>
        ))}

        {/* View mode toggles */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {[
            { mode: 'grid', icon: <FiGrid size={16} /> },
            { mode: 'list', icon: <FiList size={16} /> },
          ].map(({ mode, icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding:      '0.4rem',
                borderRadius: 'var(--radius-sm)',
                color:        viewMode === mode ? 'var(--accent)' : 'var(--text-muted)',
                background:   viewMode === mode ? 'var(--accent-light)' : 'none',
                border:       'none',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                transition:   'all 0.15s',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Posts Grid / List ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {posts.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <FiGrid size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                {isOwnProfile ? "You haven't posted anything yet." : 'No posts yet.'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{
              display:              'grid',
              gridTemplateColumns:  'repeat(3, 1fr)',
              gap:                  '3px',
              borderRadius:         'var(--radius-md)',
              overflow:             'hidden',
            }}>
              {posts.map((post, i) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    aspectRatio: '1',
                    overflow:    'hidden',
                    background:  'var(--bg-tertiary)',
                    cursor:      'pointer',
                    position:    'relative',
                  }}
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="post"
                      style={{
                        width:      '100%',
                        height:     '100%',
                        objectFit:  'cover',
                        transition: 'transform 0.3s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{
                      width:          '100%',
                      height:         '100%',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      padding:        '0.75rem',
                      background:     'var(--bg-tertiary)',
                    }}>
                      <p style={{
                        fontSize:            '0.75rem',
                        color:               'var(--text-secondary)',
                        textAlign:           'center',
                        overflow:            'hidden',
                        display:             '-webkit-box',
                        WebkitLineClamp:     4,
                        WebkitBoxOrient:     'vertical',
                      }}>
                        {post.content}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Edit Profile Modal ── */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onUpdated={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
      />

      {/* ── Followers / Following Modal ── */}
      <Modal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        title={
          followModalType === 'followers'
            ? `Followers (${profile.followers?.length || 0})`
            : `Following (${profile.following?.length || 0})`
        }
        maxWidth="400px"
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {(followModalType === 'followers' ? profile.followers : profile.following)?.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No {followModalType} yet.
            </p>
          ) : (
            (followModalType === 'followers' ? profile.followers : profile.following)?.map((u) => (
              <div
                key={u._id}
                style={{
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '0.75rem',
                  padding:    '0.75rem 1.25rem',
                  cursor:     'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => { setShowFollowModal(false); navigate(`/profile/${u.username}`); }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Avatar src={u.profilePicture} size={42} username={u.username} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {u.username}
                  </p>
                  {u.bio && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {u.bio.slice(0, 40)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Profile;