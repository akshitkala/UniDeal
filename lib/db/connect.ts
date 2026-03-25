import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

declare global {
  var _mongoConn: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

if (!global._mongoConn) {
  global._mongoConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (global._mongoConn.conn) return global._mongoConn.conn;

  if (!global._mongoConn.promise) {
    global._mongoConn.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  global._mongoConn.conn = await global._mongoConn.promise;
  return global._mongoConn.conn;
}