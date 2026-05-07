//frontend/src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/chat/conversations');
      return data.conversations;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/chat/messages/${conversationId}`);
      return { conversationId, messages: data.messages };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/chat/message', { conversationId, content });
      return data.message;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// ✅ Helper — reused in both reducers
const pushIfNew = (msgArray, msg) => {
  const exists = msgArray.some((m) => m._id === msg._id);
  if (!exists) msgArray.push(msg);
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations:      [],
    activeConversation: null,
    messages:           {},
    loading:            false,
    typingUsers:        {},
    onlineUsers:        [],
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },

    addIncomingMessage: (state, action) => {
      const msg    = action.payload;
      const convId = msg.conversation;
      if (!state.messages[convId]) state.messages[convId] = [];

      // ✅ FIX 1 — skip if socket delivers message that HTTP already added
      pushIfNew(state.messages[convId], msg);

      const conv = state.conversations.find((c) => c._id === convId);
      if (conv) conv.lastMessage = msg;
    },

    setTyping: (state, action) => {
      const { userId, isTyping, conversationId } = action.payload;
      if (!state.typingUsers[conversationId]) state.typingUsers[conversationId] = {};
      state.typingUsers[conversationId][userId] = isTyping;
    },
    setOnlineUsers:   (state, action) => { state.onlineUsers = action.payload; },
    addOnlineUser:    (state, action) => {
      if (!state.onlineUsers.includes(action.payload))
        state.onlineUsers.push(action.payload);
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending,   (state) => { state.loading = true; })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading      = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected,  (state) => { state.loading = false; })

      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        // fetchMessages always replaces — this is intentional (clean server state)
        state.messages[conversationId] = messages;
      })

      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg    = action.payload;
        const convId = msg.conversation;
        if (!state.messages[convId]) state.messages[convId] = [];

        // ✅ FIX 2 — skip if socket already delivered this message first
        pushIfNew(state.messages[convId], msg);

        const conv = state.conversations.find((c) => c._id === convId);
        if (conv) conv.lastMessage = msg;
      });
  },
});

export const {
  setActiveConversation,
  addIncomingMessage,
  setTyping,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} = chatSlice.actions;

export default chatSlice.reducer;