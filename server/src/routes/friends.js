import { Router } from 'express';
import User from '../models/User.js';
import FriendRequest from '../models/FriendRequest.js';
import Friendship from '../models/Friendship.js';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const me = req.session.userId;
  const [friendships, incomingRequests, outgoingRequests] = await Promise.all([
    Friendship.find({ users: me }).populate('users', 'name username profileImage'),
    FriendRequest.find({ to: me }).populate('from', 'name username profileImage').sort({ createdAt: -1 }),
    FriendRequest.find({ from: me }).select('to'),
  ]);
  const friends = friendships.map((item) => item.users.find((user) => user.id !== me));
  const excluded = [me, ...friends.map((friend) => friend.id), ...incomingRequests.map((request) => request.from.id), ...outgoingRequests.map((request) => request.to.toString())];
  const suggestions = await User.find({ _id: { $nin: excluded } }).sort({ createdAt: -1 }).limit(5);
  res.json({ friends, incomingRequests, outgoingRequests, suggestions });
});

router.post('/requests/:userId', async (req, res) => {
  const me = req.session.userId;
  const target = await User.findById(req.params.userId);
  if (!target || target.id === me) return res.status(404).json({ error: 'Traveler not found.' });
  const [existing, reverse, friendship] = await Promise.all([
    FriendRequest.exists({ from: me, to: target.id }), FriendRequest.findOne({ from: target.id, to: me }), Friendship.exists({ pairKey: [me, target.id].sort().join(':') }),
  ]);
  if (friendship || existing) return res.status(409).json({ error: 'A friend request or friendship already exists.' });
  if (reverse) return res.status(409).json({ error: 'They already sent you a request. Accept it from your friend requests.' });
  const request = await FriendRequest.create({ from: me, to: target.id });
  const sender = await User.findById(me);
  await Notification.create({ user: target.id, message: `@${sender.username} sent you a friend request.` });
  res.status(201).json({ request });
});

router.post('/requests/:userId/accept', async (req, res) => {
  const me = req.session.userId;
  const request = await FriendRequest.findOne({ from: req.params.userId, to: me });
  if (!request) return res.status(404).json({ error: 'Friend request no longer exists.' });
  const users = [request.from.toString(), request.to.toString()].sort();
  await Friendship.updateOne({ pairKey: users.join(':') }, { $setOnInsert: { users, pairKey: users.join(':') } }, { upsert: true });
  await FriendRequest.deleteOne({ _id: request.id });
  const accepter = await User.findById(me);
  await Notification.create({ user: request.from, message: `@${accepter.username} accepted your friend request.` });
  res.json({ ok: true });
});

router.delete('/requests/:userId', async (req, res) => {
  const removed = await FriendRequest.findOneAndDelete({ $or: [
    { from: req.params.userId, to: req.session.userId }, { from: req.session.userId, to: req.params.userId },
  ] });
  if (!removed) return res.status(404).json({ error: 'Friend request no longer exists.' });
  res.json({ ok: true });
});

router.delete('/:userId', async (req, res) => {
  const result = await Friendship.deleteOne({ pairKey: [req.session.userId, req.params.userId].sort().join(':') });
  if (!result.deletedCount) return res.status(404).json({ error: 'Friendship not found.' });
  res.json({ ok: true });
});

export default router;
