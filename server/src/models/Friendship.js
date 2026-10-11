import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  legacyId: { type: Number, unique: true, sparse: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  pairKey: { type: String, unique: true, required: true },
}, { timestamps: true });
friendshipSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Friendship', friendshipSchema);
