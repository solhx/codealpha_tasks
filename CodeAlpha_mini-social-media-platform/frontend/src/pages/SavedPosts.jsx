//frontend/src/pages/SavedPosts.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBookmark } from 'react-icons/fi';
import api from '../api/axios';
import PostCard from '../components/common/PostCard';
import Loader from '../components/common/Loader';

const SavedPosts = () => {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/users/saved');
        setPosts(data.posts);
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <Loader fullScreen text="Loading saved posts..." />;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <FiBookmark size={22} style={{ color: 'var(--accent)' }} />
        Saved Posts
      </motion.h2>

      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{ padding: '4rem', textAlign: 'center' }}
        >
          <FiBookmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
            No saved posts
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Tap the bookmark icon on any post to save it here.
          </p>
        </motion.div>
      ) : (
        <AnimatePresence>
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default SavedPosts;