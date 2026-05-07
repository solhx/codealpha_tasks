//frontend/src/hooks/usePosts.js
import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchFeedPosts,
  fetchExplorePosts,
  createPost,
  deletePost,
  likeUnlikePost,
} from '../redux/slices/postSlice';

const usePosts = () => {
  const dispatch = useDispatch();
  const { feedPosts, explorePosts, loading, createLoading, hasMore, pagination } =
    useSelector((s) => s.posts);

  const loadFeed    = useCallback((page = 1) => dispatch(fetchFeedPosts({ page })),    [dispatch]);
  const loadExplore = useCallback((page = 1) => dispatch(fetchExplorePosts({ page })), [dispatch]);

  const submitPost = useCallback(
    (formData) => dispatch(createPost(formData)),
    [dispatch]
  );

  const removePost = useCallback(
    (postId) => dispatch(deletePost(postId)),
    [dispatch]
  );

  const toggleLike = useCallback(
    (postId) => dispatch(likeUnlikePost(postId)),
    [dispatch]
  );

  return {
    feedPosts,
    explorePosts,
    loading,
    createLoading,
    hasMore,
    pagination,
    loadFeed,
    loadExplore,
    submitPost,
    removePost,
    toggleLike,
  };
};

export default usePosts;