//frontend/src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { fetchFeedPosts } from '../redux/slices/postSlice';
import PostCard from '../components/common/PostCard';
import Loader from '../components/common/Loader';
import StoryRow from '../components/common/StoryRow';
import CreatePostModal from '../components/common/CreatePostModal';
import Button from '../components/common/Button';

const Home = () => {
  const dispatch = useDispatch();
  const { feedPosts, loading, hasMore, pagination } = useSelector((state) => state.posts);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const observer = useRef(null);

  useEffect(() => {
    dispatch(fetchFeedPosts({ page: 1 }));
  }, [dispatch]);

  // Infinite scroll sentinel
  const sentinelRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          dispatch(fetchFeedPosts({ page: nextPage }));
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page, dispatch]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await dispatch(fetchFeedPosts({ page: 1 }));
    setRefreshing(false);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Stories */}
      <StoryRow />

      {/* Create Post CTA */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{
          padding: '0.875rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          cursor: 'pointer',
        }}
        onClick={() => setShowCreate(true)}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.2rem',
            flexShrink: 0,
          }}
        >
          +
        </div>
        <div
          style={{
            flex: 1,
            padding: '0.6rem 1rem',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            border: '1.5px solid var(--border)',
          }}
        >
          What's on your mind?
        </div>
      </motion.div>

      {/* Refresh button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing}
          icon={<FiRefreshCw size={14} />}
        >
          Refresh
        </Button>
      </div>

      {/* Feed */}
      {loading && feedPosts.length === 0 ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : feedPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card"
          style={{
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <FiTrendingUp size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: 700 }}>
            Your feed is empty
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Follow some people to see their posts here.
          </p>
          <Button onClick={() => (window.location.href = '/search')}>Explore Users</Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          {feedPosts.map((post, i) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i < 5 ? i * 0.05 : 0 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} style={{ height: 1 }} />

      {/* Loading more */}
      {loading && feedPosts.length > 0 && (
        <Loader size="sm" type="beat" />
      )}

      {/* End of feed */}
      {!hasMore && feedPosts.length > 0 && (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            padding: '2rem 0',
          }}
        >
          You've reached the end 🎉
        </p>
      )}

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

const PostSkeleton = () => (
  <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
      <div>
        <div className="skeleton" style={{ width: 120, height: 13, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: 80, height: 11 }} />
      </div>
    </div>
    <div className="skeleton" style={{ height: 14, width: '90%', marginBottom: 8 }} />
    <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 12 }} />
    <div className="skeleton" style={{ height: 280, borderRadius: 'var(--radius-md)' }} />
  </div>
);

export default Home;