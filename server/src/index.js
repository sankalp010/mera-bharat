import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import friendRoutes from './routes/friends.js';
import notificationRoutes from './routes/notifications.js';
import contactRoutes from './routes/contact.js';
import { validateOrigin } from './middleware/auth.js';

const port = Number(process.env.PORT || 4000);
const dirname = path.dirname(fileURLToPath(import.meta.url));
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mera_bharat');
} catch (error) {
  console.error('Could not connect to MongoDB. Check MONGODB_URI and ensure MongoDB is running.', error.message);
  process.exit(1);
}
const app = express();
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set in production.');
}
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: { directives: { 'style-src': ["'self'", "'unsafe-inline'"] } },
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(validateOrigin);
app.use(session({
  name: 'mera.sid',
  secret: process.env.SESSION_SECRET || 'development-only-change-me-before-deploying-mera-bharat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ clientPromise: Promise.resolve(mongoose.connection.getClient()), dbName: mongoose.connection.name, collectionName: 'sessions' }),
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 14 },
}));

app.get('/api/health', (_req, res) => res.json({ status: mongoose.connection.readyState === 1 ? 'ok' : 'starting' }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false }), contactRoutes);
app.use('/uploads', express.static(path.resolve(process.env.UPLOAD_DIR || 'server/uploads'), { maxAge: '7d', immutable: true }));

if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.resolve(dirname, '../../client/dist');
  app.use(express.static(clientBuild));
  app.get(/^(?!\/api|\/uploads).*/, (_req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

app.use((error, _req, res, _next) => {
  if (error.name === 'MulterError') return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'Images must be 8 MB or smaller.' : error.message });
  if (error.name === 'ValidationError') return res.status(400).json({ error: error.message });
  if (error.code === 11000) return res.status(409).json({ error: 'That email or username is already in use.' });
  if (error.message?.startsWith('Upload a')) return res.status(400).json({ error: error.message });
  console.error(error);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(port, () => console.log(`MERA BHARAT API listening on http://localhost:${port}`));
