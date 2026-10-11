import { Router } from 'express';
import { z } from 'zod';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const filter = {};
  if (req.query.username) {
    const user = await User.findOne({ username: String(req.query.username).toLowerCase() });
    if (!user) return res.json({ posts: [] });
    filter.author = user.id;
  }
  const posts = await Post.find(filter).populate('author', 'name username profileImage').sort({ createdAt: -1 }).limit(60);
  res.json({ posts });
});

router.post('/', imageUpload.single('image'), async (req, res) => {
  const input = z.object({ content: z.string().trim().max(4000).default('') }).safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Post text must be 4,000 characters or fewer.' });
  if (!input.data.content && !req.file) return res.status(400).json({ error: 'Write a note or add a photo before sharing.' });
  const post = await Post.create({ author: req.session.userId, content: input.data.content,
    image: req.file ? `/uploads/${req.file.filename}` : '' });
  await post.populate('author', 'name username profileImage');
  res.status(201).json({ post });
});

router.delete('/:postId', async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.postId, author: req.session.userId });
  if (!post) return res.status(404).json({ error: 'Post not found or you do not own it.' });
  res.json({ ok: true });
});

export default router;
