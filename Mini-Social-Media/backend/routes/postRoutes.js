//backend/routes/postRoutes.js
const express = require('express');
const {
  createPost,
  getFeedPosts,
  getExplorePosts,
  getPost,
  updatePost,
  deletePost,
  likeUnlikePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/feed', getFeedPosts);
router.get('/explore', getExplorePosts);
router.post('/', upload.single('image'), createPost);
router.get('/:id', getPost);
router.put('/:id', upload.single('image'), updatePost);
router.delete('/:id', deletePost);
router.put('/:id/like', likeUnlikePost);

module.exports = router;