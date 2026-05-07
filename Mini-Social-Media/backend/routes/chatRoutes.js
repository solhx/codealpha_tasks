//backend/routes/chatRoutes.js
const express = require('express');
const {
  getOrCreateConversation,
  getConversations,
  sendMessage,
  getMessages,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.post('/message', upload.single('image'), sendMessage);
router.get('/messages/:conversationId', getMessages);

module.exports = router;