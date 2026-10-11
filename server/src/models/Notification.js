import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  legacyId: { type: Number, unique: true, sparse: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  message: { type: String, required: true, maxlength: 300 },
  readAt: { type: Date, default: null },
}, { timestamps: true });
notificationSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);
