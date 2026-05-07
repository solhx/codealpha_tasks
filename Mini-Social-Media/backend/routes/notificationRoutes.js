//backend/routes/notificationRoutes.js
const express = require('express');
const {
  getNotifications,
  markAllRead,
  markOneRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/read', markAllRead);
router.put('/:id/read', markOneRead);
router.delete('/:id', deleteNotification);

module.exports = router;