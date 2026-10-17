import mongoose from 'mongoose';

// Named counters, incremented atomically. Used for the "cars launched" hit counter.
const counterSchema = new mongoose.Schema(
  {
    _id: { type: String },
    count: { type: Number, default: 0 },
  },
  { versionKey: false },
);

export default mongoose.model('Counter', counterSchema);
