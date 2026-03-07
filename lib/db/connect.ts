import mongoose from 'mongoose';

const URI = process.env.MONGODB_URI!;

if (!URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
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
    global._mongoConn.promise = mongoose.connect(URI, {
      maxPoolSize: 10,
      bufferCommands: false,
      family: 4,
    });
  }

  global._mongoConn.conn = await global._mongoConn.promise;
  return global._mongoConn.conn;
}
