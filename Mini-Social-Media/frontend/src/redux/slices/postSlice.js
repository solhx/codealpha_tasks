//frontend/src/redux/slices/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export const fetchFeedPosts = createAsyncThunk(
  'posts/fetchFeed',
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/posts/feed?page=${page}&limit=10`);
      return { ...data, page };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchExplorePosts = createAsyncThunk(
  'posts/fetchExplore',
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/posts/explore?page=${page}&limit=12`);
      return { ...data, page };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.post;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${postId}`);
      return postId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const likeUnlikePost = createAsyncThunk(
  'posts/likeUnlike',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/posts/${postId}/like`);
      return { postId, action: data.action, likes: data.likes };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    feedPosts: [],
    explorePosts: [],
    pagination: {},
    loading: false,
    createLoading: false,
    error: null,
    hasMore: true,
  },
  reducers: {
    addNewPostToFeed: (state, action) => {
      state.feedPosts.unshift(action.payload);
    },
    clearPosts: (state) => {
      state.feedPosts = [];
      state.explorePosts = [];
      state.hasMore = true;
    },
    updatePostInFeed: (state, action) => {
      const idx = state.feedPosts.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) state.feedPosts[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeedPosts.pending, (state) => { state.loading = true; })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.feedPosts = action.payload.posts;
        } else {
          state.feedPosts = [...state.feedPosts, ...action.payload.posts];
        }
        state.pagination = action.payload.pagination;
        state.hasMore = action.payload.page < action.payload.pagination?.pages;
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchExplorePosts.pending, (state) => { state.loading = true; })
      .addCase(fetchExplorePosts.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.page === 1) {
          state.explorePosts = action.payload.posts;
        } else {
          state.explorePosts = [...state.explorePosts, ...action.payload.posts];
        }
      })
      .addCase(fetchExplorePosts.rejected, (state) => { state.loading = false; })

      .addCase(createPost.pending, (state) => { state.createLoading = true; })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createLoading = false;
        state.feedPosts.unshift(action.payload);
        toast.success('Post shared successfully! 🚀');
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createLoading = false;
        toast.error(action.payload || 'Failed to create post');
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.feedPosts = state.feedPosts.filter((p) => p._id !== action.payload);
        state.explorePosts = state.explorePosts.filter((p) => p._id !== action.payload);
        toast.success('Post deleted');
      })

      .addCase(likeUnlikePost.fulfilled, (state, action) => {
        const { postId, action: act, likes } = action.payload;
        const update = (list) => {
          const post = list.find((p) => p._id === postId);
          if (post) {
            post.likeCount = likes;
            post.isLiked = act === 'liked';
          }
        };
        update(state.feedPosts);
        update(state.explorePosts);
      });
  },
});

export const { addNewPostToFeed, clearPosts, updatePostInFeed } = postSlice.actions;
export default postSlice.reducer;