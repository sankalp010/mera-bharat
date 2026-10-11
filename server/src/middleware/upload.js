import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import multer from 'multer';

const uploadRoot = path.resolve(process.env.UPLOAD_DIR || 'server/uploads');
fs.mkdirSync(uploadRoot, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, uploadRoot),
  filename: (_req, file, done) => {
    const extension = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' }[file.mimetype];
    done(null, `${Date.now()}-${randomUUID()}${extension}`);
  },
});
export const imageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, done) => {
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) return done(new Error('Upload a JPG, PNG, WebP, or GIF image.'));
    done(null, true);
  },
});
