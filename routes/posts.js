import express from 'express';
import auth from '../middleware/auth.js';
import Post from '../models/posts.js';

const router = express.Router();

// Create post
router.post('/', auth, async (req, res) => {
	try {
		const { title, content } = req.body;
		if (!title || !content) {
			return res.status(400).json({ message: 'Title and content are required' });
		}
		const post = new Post({ title, content, authorId: req.user.id });
		const result = await post.save();
		return res.status(201).json({ postId: result.insertedId });
	} catch (err) {
		console.error('Create post error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// List posts (paginated)
router.get('/', async (req, res) => {
	try {
		const { skip = 0, limit = 20 } = req.query;
		const posts = await Post.findAll({ skip: Number(skip), limit: Number(limit) });
		return res.json(posts);
	} catch (err) {
		console.error('List posts error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Get post by id
router.get('/:id', async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) return res.status(404).json({ message: 'Post not found' });
		return res.json(post);
	} catch (err) {
		console.error('Get post error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Update post (author only)
router.put('/:id', auth, async (req, res) => {
	try {
		const { title, content } = req.body;
		const existing = await Post.findById(req.params.id);
		if (!existing) return res.status(404).json({ message: 'Post not found' });
		if (existing.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
		const { value } = await Post.updateById(req.params.id, { title, content });
		return res.json(value);
	} catch (err) {
		console.error('Update post error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

// Delete post (author only)
router.delete('/:id', auth, async (req, res) => {
	try {
		const existing = await Post.findById(req.params.id);
		if (!existing) return res.status(404).json({ message: 'Post not found' });
		if (existing.authorId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
		await Post.deleteById(req.params.id);
		return res.status(204).send();
	} catch (err) {
		console.error('Delete post error:', err);
		return res.status(500).json({ message: 'Server error' });
	}
});

export default router; 