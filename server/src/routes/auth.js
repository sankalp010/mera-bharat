import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const registration = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8).max(72),
  acceptedTerms: z.literal(true),
});
const login = z.object({ username: z.string().trim().min(1), password: z.string().min(1).max(72) });

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const user = await User.findById(req.session.userId);
  if (!user) { req.session.destroy(() => {}); return res.json({ user: null }); }
  res.json({ user });
});

router.post('/register', async (req, res) => {
  const input = registration.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: input.error.issues[0].message });
  const { name, email, username, password } = input.data;
  if (await User.exists({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] })) {
    return res.status(409).json({ error: 'That email or username is already in use.' });
  }
  const user = await User.create({ name, email, username, passwordHash: await bcrypt.hash(password, 12) });
  req.session.userId = user.id;
  await Notification.create({ user: user.id, message: 'Welcome to MERA BHARAT. Your next journey starts here.' });
  res.status(201).json({ user });
});

router.post('/login', async (req, res) => {
  const input = login.safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: 'Enter your username and password.' });
  const user = await User.findOne({ username: input.data.username.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(input.data.password, user.passwordHash))) return res.status(401).json({ error: 'Username or password is incorrect.' });
  await new Promise((resolve, reject) => req.session.regenerate((error) => error ? reject(error) : resolve()));
  req.session.userId = user.id;
  res.json({ user });
});

router.post('/logout', requireAuth, (req, res, next) => req.session.destroy((error) => {
  if (error) return next(error);
  res.clearCookie('mera.sid', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ ok: true });
}));

export default router;
