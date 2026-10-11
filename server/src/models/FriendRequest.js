import mongoose from 'mongoose';

const friendRequestSchema = new mongoose.Schema({
  legacyId: { type: Number, unique: true, sparse: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
friendRequestSchema.index({ from: 1, to: 1 }, { unique: true });
friendRequestSchema.set('toJSON', { virtuals: true });

export default mongoose.model('FriendRequest', friendRequestSchema);
