import express from 'express';
import auth from '../middleware/auth.js';
import Comment from '../models/comments.js';
import Post from '../models/posts.js';

const router = express.Router({ mergeParams: true });

// Create comment on a post
router.post('/:postId/comments', auth, async (req, res) => {
	try {
		const { text, richText } = req.body;
		if (!text) return res.status(400).json({ message: 'Text is required' });
		const post = await Post.findById(req.params.postId);
		if (!post) return res.status(404).json({ message: 'Post not found' });
		const comment = new Comment({ postId: req.params.postId, authorId: req.user.id, text, richText: richText ?? null });
		const result = await comment.save();
		return res.status(201).json({ commentId: result.insertedId });
	} catch (err) {
		console.error('Create comment error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Reply to an existing comment
router.post('/comments/:id/replies', auth, async (req, res) => {
	try {
		const { text, richText } = req.body;
		if (!text) return res.status(400).json({ message: 'Text is required' });
		const parent = await Comment.findById(req.params.id);
		if (!parent) return res.status(404).json({ message: 'Parent comment not found' });
		const reply = new Comment({ postId: parent.postId, authorId: req.user.id, text, richText: richText ?? null, parentCommentId: req.params.id });
		const result = await reply.save();
		return res.status(201).json({ commentId: result.insertedId });
	} catch (err) {
		console.error('Create reply error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// List top-level comments for a post
router.get('/:postId/comments', async (req, res) => {
	try {
		const { skip = 0, limit = 50 } = req.query;
		const post = await Post.findById(req.params.postId);
		if (!post) return res.status(404).json({ message: 'Post not found' });
		const comments = await Comment.findByPostId(req.params.postId, { skip: Number(skip), limit: Number(limit) });
		return res.json(comments);
	} catch (err) {
		console.error('List comments error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// List replies for a comment
router.get('/comments/:id/replies', async (req, res) => {
	try {
		const { skip = 0, limit = 50 } = req.query;
		const parent = await Comment.findById(req.params.id);
		if (!parent) return res.status(404).json({ message: 'Parent comment not found' });
		const replies = await Comment.findReplies(req.params.id, { skip: Number(skip), limit: Number(limit) });
		return res.json(replies);
	} catch (err) {
		console.error('List replies error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Update a comment (author only)
router.put('/comments/:id', auth, async (req, res) => {
	try {
		const { text, richText } = req.body;
		const existing = await Comment.findById(req.params.id);
		if (!existing) return res.status(404).json({ message: 'Comment not found' });
		if (existing.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
		const { value } = await Comment.updateById(req.params.id, { text, richText });
		return res.json(value);
	} catch (err) {
		console.error('Update comment error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Delete a comment (author only)
router.delete('/comments/:id', auth, async (req, res) => {
	try {
		const existing = await Comment.findById(req.params.id);
		if (!existing) return res.status(404).json({ message: 'Comment not found' });
		if (existing.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
		await Comment.deleteById(req.params.id);
		return res.status(204).send();
	} catch (err) {
		console.error('Delete comment error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

export default router; 