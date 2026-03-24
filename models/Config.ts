import mongoose, { Schema } from 'mongoose';

const ConfigSchema = new Schema({
  key: { type: String, unique: true },
  value: Schema.Types.Mixed,
  label: String,
  description: String,
});

export default mongoose.models.Config || mongoose.model('Config', ConfigSchema);
