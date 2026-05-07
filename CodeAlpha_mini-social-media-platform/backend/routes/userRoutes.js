//backend/routes/userRoutes.js
const express = require('express');
const {
  getUserProfile,
  updateProfile,
  followUnfollowUser,
  searchUsers,
  getSuggestedUsers,
  saveUnsavePost,
  getSavedPosts,
  addStory,
  getAllUsers,
  getFollowingStories,   // ← ADD THIS IMPORT
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/search',             searchUsers);
router.get('/suggestions',        getSuggestedUsers);
router.get('/saved',              getSavedPosts);
router.get('/following/stories',  getFollowingStories);  // ✅ NEW — MUST be before /:username
router.put('/save/:postId',       saveUnsavePost);
router.post('/story',             upload.single('image'), addStory);
router.get('/admin/all',          restrictTo('admin'), getAllUsers);

// ⚠️  Wildcard routes LAST — they catch anything above if placed earlier
router.get('/:username',  getUserProfile);
router.put('/profile',    upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPhoto',     maxCount: 1 },
]), updateProfile);
router.put('/:id/follow', followUnfollowUser);

module.exports = router;