//frontend/src/context/SocketContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNewNotification } from '../redux/slices/notificationSlice';
import {
  addIncomingMessage,
  setTyping,
  addOnlineUser,
  removeOnlineUser,
} from '../redux/slices/chatSlice';
import { addNewPostToFeed } from '../redux/slices/postSlice';
import toast from 'react-hot-toast';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef       = useRef(null);
  const dispatch        = useDispatch();
  const token           = useSelector((s) => s.auth.token);
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);

  /* ── Stable event handlers (won't trigger re-renders) ─────────────── */
  const handleNotification = useCallback(
    (notification) => {
      dispatch(addNewNotification(notification));
      const icons = { like: '❤️', comment: '💬', follow: '👤', mention: '🔔' };
      const texts = {
        like:    'liked your post',
        comment: 'commented on your post',
        follow:  'started following you',
        mention: 'mentioned you',
      };
      toast(
        `${icons[notification.type] || '🔔'} ${notification.sender?.username} ${
          texts[notification.type] || 'interacted with you'
        }`,
        { duration: 4000 }
      );
    },
    [dispatch]
  );

  const handleNewMessage  = useCallback((msg)    => dispatch(addIncomingMessage(msg)),      [dispatch]);
  const handleNewPost     = useCallback((post)   => dispatch(addNewPostToFeed(post)),        [dispatch]);
  const handleUserOnline  = useCallback((userId) => dispatch(addOnlineUser(userId)),         [dispatch]);
  const handleUserOffline = useCallback((userId) => dispatch(removeOnlineUser(userId)),      [dispatch]);
  const handleTyping      = useCallback(
    ({ userId, conversationId, isTyping }) =>
      dispatch(setTyping({ userId, conversationId, isTyping })),
    [dispatch]
  );

  useEffect(() => {
    /* Only connect when authenticated */
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    /* Prevent duplicate connections */
    if (socketRef.current?.connected) return;

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      {
        auth:                  { token },
        transports:            ['websocket', 'polling'],
        reconnection:          true,
        reconnectionAttempts:  10,
        reconnectionDelay:     2000,
        reconnectionDelayMax:  10000,
        forceNew:              false,
      }
    );

    socketRef.current = socket;

    socket.on('connect',       () => console.log('🔌 Socket connected:', socket.id));
    socket.on('disconnect',    (r) => console.log('❌ Socket disconnected:', r));
    socket.on('connect_error', (e) => console.error('Socket error:', e.message));

    socket.on('newNotification', handleNotification);
    socket.on('newMessage',      handleNewMessage);
    socket.on('newPost',         handleNewPost);
    socket.on('userOnline',      handleUserOnline);
    socket.on('userOffline',     handleUserOffline);
    socket.on('typing',          handleTyping);

    return () => {
      socket.off('newNotification', handleNotification);
      socket.off('newMessage',      handleNewMessage);
      socket.off('newPost',         handleNewPost);
      socket.off('userOnline',      handleUserOnline);
      socket.off('userOffline',     handleUserOffline);
      socket.off('typing',          handleTyping);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    token,
    isAuthenticated,
    handleNotification,
    handleNewMessage,
    handleNewPost,
    handleUserOnline,
    handleUserOffline,
    handleTyping,
  ]);

  return (
    <SocketContext.Provider value={socketRef}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);