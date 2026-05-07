//backend/socket/socketHandler.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const connectedUsers = new Map(); // userId → Set of socketIds

const socketHandler = (io) => {
  // ── Auth middleware ──────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error: no token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('username profilePicture isActive');

      if (!user)           return next(new Error('User not found'));
      if (!user.isActive)  return next(new Error('Account deactivated'));

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  // ── Connection ────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Track multiple tabs / devices
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Join personal notification room
    socket.join(userId);

    // Broadcast online status only on FIRST connection
    if (connectedUsers.get(userId).size === 1) {
      socket.broadcast.emit('userOnline', userId);
    }

    console.log(
      `🔌 ${socket.user.username} connected (${socket.id}) — ${connectedUsers.get(userId).size} session(s)`
    );

    // ── Conversation rooms ─────────────────────────────────────────────────
    socket.on('joinConversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    // ── Typing ────────────────────────────────────────────────────────────
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conv_${conversationId}`).emit('typing', {
        userId,
        username:       socket.user.username,
        conversationId,
        isTyping,
      });
    });

    // ── Message read ──────────────────────────────────────────────────────
    socket.on('messageRead', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('messageRead', {
        userId,
        conversationId,
      });
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnect', async (reason) => {
      const sessions = connectedUsers.get(userId);
      if (sessions) {
        sessions.delete(socket.id);
        if (sessions.size === 0) {
          // Last session closed → truly offline
          connectedUsers.delete(userId);
          socket.broadcast.emit('userOffline', userId);

          // Update lastSeen
          try {
            await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
          } catch { /* non-critical */ }

          console.log(`❌ ${socket.user.username} fully disconnected (${reason})`);
        } else {
          console.log(
            `⚠️  ${socket.user.username} tab closed — ${sessions.size} session(s) remaining`
          );
        }
      }
    });
  });

  return { connectedUsers };
};

module.exports = socketHandler;