import { Router } from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', async (req, res) => {
  const notifications = await Notification.find({ user: req.session.userId }).sort({ createdAt: -1 }).limit(50);
  res.json({ notifications });
});
router.patch('/:notificationId/read', async (req, res) => {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.notificationId, user: req.session.userId },
    { readAt: new Date() }, { new: true });
  if (!notification) return res.status(404).json({ error: 'Notification not found.' });
  res.json({ notification });
});
export default router;
