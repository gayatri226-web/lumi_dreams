import mongoose from 'mongoose';
import Wish from './models/Wish.js';
import Counter from './models/Counter.js';

// Data access with two backends: MongoDB when MONGODB_URI is set, otherwise an
// in-memory store so the app runs with zero setup (data resets on restart).
const VISIT_BASE = 1204; // the counter starts here so it reads like a well-loved old site

const memory = {
  wishes: [
    { _id: 'seed-1', name: 'Puff', wish: 'Please make a car with a nap button.', createdAt: new Date('2026-10-17T14:35:00Z') },
    { _id: 'seed-2', name: 'The Moon', wish: 'Come visit soon. I have your spot ready.', createdAt: new Date('2026-10-17T14:10:00Z') },
  ],
  visits: VISIT_BASE,
};

export let usingMongo = false;

export async function connect(uri) {
  if (!uri) {
    console.log('[store] MONGODB_URI not set, using in-memory store');
    return;
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  usingMongo = true;
  console.log('[store] connected to MongoDB');
}

export async function listWishes(limit) {
  if (!usingMongo) return memory.wishes.slice(0, limit);
  return Wish.find().sort({ createdAt: -1 }).limit(limit).lean();
}

export async function createWish({ name, wish }) {
  if (!usingMongo) {
    const entry = { _id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, wish, createdAt: new Date() };
    memory.wishes.unshift(entry);
    memory.wishes.length = Math.min(memory.wishes.length, 200);
    return entry;
  }
  const doc = await Wish.create({ name, wish });
  return doc.toObject();
}

export async function readVisits() {
  if (!usingMongo) return memory.visits;
  const doc = await Counter.findById('visits').lean();
  return VISIT_BASE + (doc?.count || 0);
}

export async function bumpVisits() {
  if (!usingMongo) return ++memory.visits;
  const doc = await Counter.findByIdAndUpdate('visits', { $inc: { count: 1 } }, { upsert: true, new: true, lean: true });
  return VISIT_BASE + doc.count;
}
