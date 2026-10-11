import { Router } from 'express';
import { z } from 'zod';
import ContactMessage from '../models/ContactMessage.js';

const router = Router();
router.post('/', async (req, res) => {
  const input = z.object({ name: z.string().trim().min(2).max(100), email: z.string().trim().email().max(254),
    message: z.string().trim().min(10).max(5000) }).safeParse(req.body);
  if (!input.success) return res.status(400).json({ error: input.error.issues[0].message });
  await ContactMessage.create(input.data);
  res.status(201).json({ message: 'Thank you. Your message has been received.' });
});
export default router;
