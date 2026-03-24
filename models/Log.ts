import mongoose, { Schema } from 'mongoose';

const LogSchema = new Schema({
  action: String,
  performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
  targetListing: { type: Schema.Types.ObjectId, ref: 'Listing' },
  metadata: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Log || mongoose.model('Log', LogSchema);
