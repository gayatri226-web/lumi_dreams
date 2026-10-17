import mongoose from 'mongoose';

// One guestbook entry: a visitor's name and their launch wish for Anew.
const wishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 24 },
    wish: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false },
);

wishSchema.index({ createdAt: -1 });

export default mongoose.model('Wish', wishSchema);
