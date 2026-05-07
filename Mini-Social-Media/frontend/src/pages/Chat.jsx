//frontend/src/pages/Chat.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSearch, FiSend, FiImage, FiArrowLeft } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  setActiveConversation,
} from '../redux/slices/chatSlice';
import { useSocket } from '../context/SocketContext';
import Avatar from '../components/common/Avatar';
import Loader from '../components/common/Loader';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Chat = () => {
  const { conversationId } = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const socketRef  = useSocket();
  const { user }   = useSelector((s) => s.auth);
  const { conversations, activeConversation, messages, loading, typingUsers, onlineUsers } =
    useSelector((s) => s.chat);

  const [text, setText]           = useState('');
  const [sending, setSending]     = useState(false);
  const [searchQ, setSearchQ]     = useState('');
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768);

  useEffect(() => {
    dispatch(fetchConversations());
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [dispatch]);

  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId));
      dispatch(setActiveConversation(conversationId));
      socketRef?.current?.emit('joinConversation', conversationId);
    }
    return () => {
      if (conversationId)
        socketRef?.current?.emit('leaveConversation', conversationId);
    };
  }, [conversationId, dispatch, socketRef]);

  const getOtherParticipant = (conv) =>
    conv.participants?.find((p) => p._id !== user?._id);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversationId) return;
    setSending(true);
    try {
      await dispatch(sendMessage({ conversationId, content: text }));
      setText('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const handleTyping = (val) => {
    setText(val);
    socketRef?.current?.emit('typing', {
      conversationId,
      isTyping: val.length > 0,
    });
  };

  const startConversation = async (userId) => {
    try {
      const { data } = await api.post('/chat/conversation', { userId });
      navigate(`/chat/${data.conversation._id}`);
    } catch { toast.error('Could not open chat'); }
  };

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    return other?.username?.toLowerCase().includes(searchQ.toLowerCase());
  });

  const activeMessages = messages[conversationId] || [];
  const activeConvData  = conversations.find((c) => c._id === conversationId);
  const otherUser       = activeConvData ? getOtherParticipant(activeConvData) : null;
  const isOnline        = onlineUsers.includes(otherUser?._id);
  const isTyping        = Object.values(typingUsers[conversationId] || {}).some(Boolean);

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - var(--navbar-height) - 2rem)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* ── Left: Conversation List ───────────────────────────────── */}
      {(!isMobile || !conversationId) && (
        <div
          style={{
            width: isMobile ? '100%' : '320px',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1rem 0.75rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.875rem' }}>
              Messages
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '0.5rem 0.875rem',
              }}
            >
              <FiSearch size={14} color="var(--text-muted)" />
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Conversation items */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && conversations.length === 0 ? (
              <Loader size="sm" />
            ) : filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <FiMessageCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No conversations yet
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other   = getOtherParticipant(conv);
                const isActive = conv._id === conversationId;
                const online  = onlineUsers.includes(other?._id);

                return (
                  <motion.div
                    key={conv._id}
                    whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                    onClick={() => navigate(`/chat/${conv._id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.875rem 1rem',
                      cursor: 'pointer',
                      background: isActive ? 'var(--accent-light)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar src={other?.profilePicture} size={46} username={other?.username} />
                      {online && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 1,
                            right: 1,
                            width: 11,
                            height: 11,
                            borderRadius: '50%',
                            background: 'var(--success)',
                            border: '2px solid var(--bg-card)',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {other?.username}
                        </p>
                        {conv.lastMessage?.createdAt && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {conv.lastMessage?.content || 'Start a conversation'}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Right: Message Window ────────────────────────────────── */}
      {(!isMobile || conversationId) && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {conversationId && otherUser ? (
            <>
              {/* Chat Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.875rem 1.25rem',
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                }}
              >
                {isMobile && (
                  <button
                    onClick={() => navigate('/chat')}
                    style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    <FiArrowLeft size={20} />
                  </button>
                )}
                <div style={{ position: 'relative' }}>
                  <Avatar src={otherUser.profilePicture} size={42} username={otherUser.username} />
                  {isOnline && (
                    <div
                      style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'var(--success)', border: '2px solid var(--bg-card)',
                      }}
                    />
                  )}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {otherUser.username}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: isOnline ? 'var(--success)' : 'var(--text-muted)' }}>
                    {isTyping ? '✍️ typing...' : isOnline ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <AnimatePresence initial={false}>
                  {activeMessages.map((msg, i) => {
                    const isOwn = msg.sender?._id === user?._id || msg.sender === user?._id;
                    const showDate =
                      i === 0 ||
                      new Date(msg.createdAt).toDateString() !==
                        new Date(activeMessages[i - 1]?.createdAt).toDateString();

                    return (
                      <div key={msg._id}>
                        {showDate && (
                          <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: 'var(--text-muted)',
                                background: 'var(--bg-tertiary)',
                                padding: '0.2rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                              }}
                            >
                              {format(new Date(msg.createdAt), 'MMMM d, yyyy')}
                            </span>
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          style={{
                            display: 'flex',
                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            alignItems: 'flex-end',
                            gap: '0.4rem',
                          }}
                        >
                          {!isOwn && (
                            <Avatar
                              src={msg.sender?.profilePicture}
                              size={28}
                              username={msg.sender?.username}
                            />
                          )}
                          <div style={{ maxWidth: '65%' }}>
                            {msg.image && (
                              <img
                                src={msg.image}
                                alt="msg"
                                style={{
                                  maxWidth: '100%',
                                  borderRadius: 'var(--radius-lg)',
                                  marginBottom: msg.content ? '0.25rem' : 0,
                                }}
                              />
                            )}
                            {msg.content && (
                              <div
                                style={{
                                  background: isOwn
                                    ? 'var(--accent)'
                                    : 'var(--bg-tertiary)',
                                  color: isOwn ? '#fff' : 'var(--text-primary)',
                                  padding: '0.6rem 0.875rem',
                                  borderRadius: isOwn
                                    ? '18px 18px 4px 18px'
                                    : '18px 18px 18px 4px',
                                  fontSize: '0.875rem',
                                  lineHeight: 1.5,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {msg.content}
                              </div>
                            )}
                            <p
                              style={{
                                fontSize: '0.65rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.2rem',
                                textAlign: isOwn ? 'right' : 'left',
                              }}
                            >
                              {format(new Date(msg.createdAt), 'h:mm a')}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <Avatar
                        src={otherUser.profilePicture}
                        size={24}
                        username={otherUser.username}
                      />
                      <div
                        style={{
                          background: 'var(--bg-tertiary)',
                          borderRadius: '18px 18px 18px 4px',
                          padding: '0.5rem 0.875rem',
                          display: 'flex',
                          gap: '3px',
                          alignItems: 'center',
                        }}
                      >
                        {[0, 1, 2].map((d) => (
                          <motion.div
                            key={d}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                            style={{
                              width: 6, height: 6,
                              borderRadius: '50%',
                              background: 'var(--text-muted)',
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Bar */}
                           <form
                onSubmit={handleSend}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1.25rem',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-input)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.5rem 1rem',
                    gap: '0.5rem',
                  }}
                >
                  <input
                    value={text}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={1000}
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={!text.trim() || sending}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: text.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: text.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: text.trim() ? 'pointer' : 'not-allowed',
                    flexShrink: 0,
                    transition: 'background 0.2s',
                  }}
                >
                  <FiSend size={17} />
                </motion.button>
              </form>
            </>
          ) : (
            /* ── No conversation selected ── */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FiMessageCircle size={36} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                Your Messages
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 280 }}>
                Send private messages to your friends and followers.
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  const username = prompt('Enter a username to message:');
                  if (!username) return;
                  try {
                    const { data } = await api.get(`/users/${username}`);
                    await startConversation(data.user._id);
                  } catch {
                    toast.error('User not found');
                  }
                }}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                New Message
              </motion.button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;