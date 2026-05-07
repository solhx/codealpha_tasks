//backend/routes/commentRoutes.js
const express = require('express');
const { addComment, deleteComment, getComments } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/:postId', getComments);
router.post('/:postId', addComment);
router.delete('/:id', deleteComment);

module.exports = router;