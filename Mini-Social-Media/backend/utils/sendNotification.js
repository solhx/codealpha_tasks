//backend/utils/sendNotification.js
const Notification = require('../models/Notification');

const sendNotification = async (io, { sender, receiver, type, post }) => {
  if (sender.toString() === receiver.toString()) return;

  const notification = await Notification.create({
    sender,
    receiver,
    type,
    post: post || null,
  });

  const populated = await notification.populate('sender', 'username profilePicture');

  // Emit real-time notification via socket
  io.to(receiver.toString()).emit('newNotification', populated);

  return notification;
};

module.exports = sendNotification;