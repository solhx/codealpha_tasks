//backend/controllers/chatController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const AppError = require('../utils/AppError');

// @desc    Get or create conversation
// @route   POST /api/chat/conversation
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { userId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate('participants', 'username profilePicture lastSeen');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
      await conversation.populate('participants', 'username profilePicture lastSeen');
    }

    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for user
// @route   GET /api/chat/conversations
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'username profilePicture lastSeen isActive')
      .populate('lastMessage')
      .sort('-updatedAt');

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/chat/message
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      image: req.file ? req.file.path : '',
    });

    await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });
    await message.populate('sender', 'username profilePicture');

    // Emit via socket
    const io = req.app.get('io');
    io.to(`conv_${conversationId}`).emit('newMessage', message);

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/chat/messages/:conversationId
const getMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.conversationId })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username profilePicture');

    res.status(200).json({ success: true, messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOrCreateConversation, getConversations, sendMessage, getMessages };