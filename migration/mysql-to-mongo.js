import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../server/src/models/User.js';
import Post from '../server/src/models/Post.js';
import FriendRequest from '../server/src/models/FriendRequest.js';
import Friendship from '../server/src/models/Friendship.js';
import Notification from '../server/src/models/Notification.js';

const mongoUri = process.env.MONGODB_URI;
const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'server/uploads');

function imageExtension(buffer) {
  if (!buffer?.length) return '';
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return '.jpg';
  if (buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return '.png';
  if (buffer.subarray(0, 3).toString() === 'GIF') return '.gif';
  if (buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return '.webp';
  return '';
}

async function importImage(buffer, bucket, legacyId) {
  if (!buffer?.length) return '';
  const ext = imageExtension(buffer);
  if (!ext) { console.warn(`Skipped unsupported image for ${bucket} #${legacyId}`); return ''; }
  const folder = path.join(uploadDir, 'imported');
  await fs.mkdir(folder, { recursive: true });
  const filename = `${bucket}-${legacyId}${ext}`;
  await fs.writeFile(path.join(folder, filename), buffer);
  return `/uploads/imported/${filename}`;
}

function passwordHash(password) {
  if (/^\$2[aby]\$\d\d\$/.test(password)) return password.startsWith('$2y$') ? `$2b$${password.slice(4)}` : password;
  return bcrypt.hash(password, 12);
}

function dateOrNow(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function rows(connection, table) {
  try { const [result] = await connection.query(`SELECT * FROM \`${table}\``); return result; }
  catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') { console.warn(`Table ${table} not found; skipping.`); return []; }
    throw error;
  }
}

async function run() {
  if (!mongoUri) throw new Error('Set MONGODB_URI before importing.');
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1', port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root', password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'IndianTourism', charset: 'utf8mb4',
  });
  try {
    await mongoose.connect(mongoUri);
    const legacyUsers = await rows(connection, 'users');
    const idMap = new Map();
    for (const row of legacyUsers) {
      const legacyId = Number(row.user_id);
      const existing = await User.findOne({ legacyId }).select('+passwordHash');
      const migratedImage = row.profile_img ? await importImage(row.profile_img, 'profile', legacyId) : '';
      const rawPassword = String(row.password || '');
      const fields = {
        legacyId, name: String(row.name || `Traveler ${legacyId}`).trim(),
        email: String(row.email || `traveler-${legacyId}@legacy.invalid`).trim().toLowerCase(),
        username: String(row.username || `traveler-${legacyId}`).trim().toLowerCase(),
        passwordHash: existing && await bcrypt.compare(rawPassword, existing.passwordHash)
          ? existing.passwordHash : await passwordHash(rawPassword), status: String(row.status || ''),
        location: String(row.location || ''), profileImage: migratedImage || existing?.profileImage || '',
      };
      const user = await User.findOneAndUpdate({ legacyId }, { $set: fields }, { upsert: true, new: true, setDefaultsOnInsert: true });
      idMap.set(legacyId, user.id);
    }
    const getUser = (id) => idMap.get(Number(id));

    for (const row of await rows(connection, 'posts')) {
      const author = getUser(row.user_id);
      if (!author) { console.warn(`Skipped post #${row.post_id}: its author was not imported.`); continue; }
      const legacyId = Number(row.post_id);
      const existing = await Post.findOne({ legacyId });
      const image = row.content_img ? await importImage(row.content_img, 'post', legacyId) : '';
      const createdAt = dateOrNow(row.created_at);
      await Post.findOneAndUpdate({ legacyId }, { $set: { legacyId, author, content: String(row.content || ''), image: image || existing?.image || '', createdAt, updatedAt: createdAt } }, { upsert: true, new: true });
    }

    const importedPairs = new Set();
    for (const row of await rows(connection, 'friends')) {
      const left = getUser(row.user_id); const right = getUser(row.friend_id);
      if (!left || !right || left === right) continue;
      const users = [left, right].sort(); const key = users.join(':');
      if (importedPairs.has(key)) continue;
      importedPairs.add(key);
      await Friendship.updateOne({ pairKey: key }, { $setOnInsert: { legacyId: Number(row.id), users, pairKey: key } }, { upsert: true });
    }

    for (const row of await rows(connection, 'friend_requests')) {
      const from = getUser(row.user_id); const to = getUser(row.friend_id);
      if (!from || !to || from === to) continue;
      await FriendRequest.updateOne({ from, to }, { $setOnInsert: { legacyId: Number(row.request_id), from, to } }, { upsert: true });
    }

    for (const row of await rows(connection, 'notifications')) {
      const user = getUser(row.user_id);
      if (!user) continue;
      await Notification.findOneAndUpdate({ legacyId: Number(row.notif_id) }, { $set: {
        legacyId: Number(row.notif_id), user, message: String(row.notification || ''),
        createdAt: dateOrNow(row.timestamp), updatedAt: dateOrNow(row.timestamp),
      } }, { upsert: true, new: true });
    }
    console.log(`Imported ${idMap.size} users and all related legacy records. Safe to rerun.`);
  } finally {
    await connection.end();
    await mongoose.disconnect();
  }
}

run().catch((error) => { console.error(`Migration failed: ${error.message}`); process.exitCode = 1; });
