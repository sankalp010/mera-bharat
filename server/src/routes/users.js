import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Friendship from '../models/Friendship.js';
import FriendRequest from '../models/FriendRequest.js';
import { requireAuth } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';

const router = Router();
router.use(requireAuth);

router.get('/search', async (req, res) => {
  const query = String(req.query.q || '').trim().slice(0, 80);
  if (query.length < 2) return res.json({ users: [] });
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const users = await User.find({ _id: { $ne: req.session.userId }, $or: [
    { name: { $regex: escaped, $options: 'i' } }, { username: { $regex: escaped, $options: 'i' } },
  ] }).limit(20);
  res.json({ users });
});

router.get('/:username', async (req, res) => {
  const profile = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!profile) return res.status(404).json({ error: 'This traveler could not be found.' });
  const [posts, friends, outgoing, incoming] = await Promise.all([
    Post.find({ author: profile.id }).populate('author', 'name username profileImage').sort({ createdAt: -1 }).limit(40),
    Friendship.find({ users: profile.id }).populate('users', 'name username profileImage'),
    FriendRequest.exists({ from: req.session.userId, to: profile.id }),
    FriendRequest.exists({ from: profile.id, to: req.session.userId }),
  ]);
  const isFriend = friends.some((friendship) => friendship.users.some((user) => user.id === req.session.userId));
  res.json({ profile, posts, friends: friends.map((friendship) => friendship.users.find((user) => user.id !== profile.id)),
    relationship: profile.id === req.session.userId ? 'self' : isFriend ? 'friends' : outgoing ? 'sent' : incoming ? 'received' : 'none' });
});

const profileUpdate = z.object({ status: z.string().trim().max(240).optional(), location: z.string().trim().max(100).optional() });
router.patch('/me/profile', async (req, res) => {
  const input = profileUpdate.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: input.error.issues[0].message });
  const user = await User.findByIdAndUpdate(req.session.userId, { $set: input.data }, { new: true, runValidators: true });
  res.json({ user });
});

router.post('/me/avatar', imageUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Choose an image to upload.' });
  const user = await User.findByIdAndUpdate(req.session.userId, { profileImage: `/uploads/${req.file.filename}` }, { new: true });
  res.json({ user });
});

export default router;
