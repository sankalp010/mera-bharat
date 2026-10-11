import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  legacyId: { type: Number, unique: true, sparse: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, default: '', maxlength: 4000 },
  image: { type: String, default: '' },
}, { timestamps: true });
postSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Post', postSchema);
