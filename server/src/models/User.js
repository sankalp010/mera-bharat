import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  legacyId: { type: Number, unique: true, sparse: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  status: { type: String, default: '', maxlength: 240 },
  location: { type: String, default: '', maxlength: 100 },
  profileImage: { type: String, default: '' },
}, { timestamps: true });

userSchema.set('toJSON', { virtuals: true, transform: (_doc, ret) => { delete ret.passwordHash; delete ret.__v; return ret; } });
export default mongoose.model('User', userSchema);
