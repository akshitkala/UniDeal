import mongoose from "mongoose";
import '@/lib/db/models';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) throw new Error("MONGODB_URI not defined");

let cached = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached;

const opts = {
  bufferCommands: false,
  maxPoolSize: 10,             // limit connections in serverless — prevents Atlas exhaustion
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,                   // force IPv4 — required on Vercel
};

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
