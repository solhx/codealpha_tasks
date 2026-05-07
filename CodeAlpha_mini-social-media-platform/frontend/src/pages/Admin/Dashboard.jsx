//frontend/src/pages/Admin/Dashboard.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiFileText, FiMessageCircle,
  FiTrendingUp, FiShield, FiTrash2, FiToggleLeft, FiToggleRight,
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="card"
    style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}
  >
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 'var(--radius-lg)',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
        {value ?? '—'}
      </p>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const navigate   = useNavigate();
  const [users, setUsers]     = useState([]);
  const [stats, setStats]     = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes] = await Promise.all([
          api.get('/users/admin/all'),
        ]);
        setUsers(usersRes.data.users);
        setStats({
          totalUsers: usersRes.data.count,
          activeUsers: usersRes.data.users.filter((u) => u.isActive).length,
          admins: usersRes.data.users.filter((u) => u.role === 'admin').length,
          verified: usersRes.data.users.filter((u) => u.isVerified).length,
        });
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleActive = async (userId, isActive) => {
    try {
      await api.put(`/users/${userId}/profile`, { isActive: !isActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: !isActive } : u))
      );
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}`);
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return <Loader fullScreen text="Loading admin dashboard..." />;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <FiShield size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              SocialSphere platform management
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1.1rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          ← Back to App
        </button>
      </motion.div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard icon={<FiUsers size={24} />}     label="Total Users"   value={stats.totalUsers}  color="#6366f1" delay={0}    />
        <StatCard icon={<FiTrendingUp size={24} />} label="Active Users"  value={stats.activeUsers} color="#10b981" delay={0.05} />
        <StatCard icon={<FiShield size={24} />}     label="Admins"        value={stats.admins}       color="#f59e0b" delay={0.1}  />
        <StatCard icon={<FiFileText size={24} />}   label="Verified"      value={stats.verified}     color="#ec4899" delay={0.15} />
      </div>

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '1.25rem',
          background: 'var(--bg-card)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          width: 'fit-content',
        }}
      >
        {['users'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
              fontFamily: 'inherit',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {tab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ overflow: 'hidden' }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 120px',
              gap: '1rem',
              padding: '0.875rem 1.25rem',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            <span>User</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          <div style={{ overflowX: 'auto' }}>
            {users.map((u, i) => (
              <motion.div
                key={u._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 120px',
                  gap: '1rem',
                  padding: '0.875rem 1.25rem',
                  alignItems: 'center',
                  borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {/* User */}
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
                  onClick={() => navigate(`/profile/${u.username}`)}
                >
                  <Avatar src={u.profilePicture} size={36} username={u.username} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {u.username}
                      {u.isVerified && (
                        <span style={{ marginLeft: 4, color: 'var(--accent)', fontSize: '0.7rem' }}>✓</span>
                      )}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {u.followers?.length || 0} followers
                    </p>
                  </div>
                </div>

                {/* Email */}
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {u.email}
                </span>

                {/* Role */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: u.role === 'admin' ? '#fef2f2' : 'var(--accent-light)',
                    color: u.role === 'admin' ? '#ef4444' : 'var(--accent)',
                    width: 'fit-content',
                  }}
                >
                  {u.role}
                </span>

                {/* Status */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: u.isActive ? '#f0fdf4' : '#fef2f2',
                    color: u.isActive ? '#10b981' : '#ef4444',
                    width: 'fit-content',
                  }}
                >
                  {u.isActive ? 'Active' : 'Inactive'}
                </span>

                {/* Joined */}
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {format(new Date(u.createdAt), 'MMM d, yyyy')}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleActive(u._id, u.isActive)}
                    title={u.isActive ? 'Deactivate' : 'Activate'}
                    style={{
                      width: 32, height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: u.isActive ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    {u.isActive ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteUser(u._id)}
                    title="Delete user"
                    style={{
                      width: 32, height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: '#fef2f2',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ef4444',
                    }}
                  >
                    <FiTrash2 size={14} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;