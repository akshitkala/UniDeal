import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function createIndexes() {
  const uri = process.env.MONGODB_URI!;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;

  const Listing = db.collection('listings');
  const User = db.collection('users');
  const Log = db.collection('logs');
  const Report = db.collection('reports');
  const Category = db.collection('categories');

  console.log('Creating Listing indexes...');
  await Promise.all([
    Listing.createIndex({ status: 1, createdAt: -1 }),
    Listing.createIndex({ slug: 1 }, { unique: true }),
    Listing.createIndex({ seller: 1, status: 1 }),
    Listing.createIndex({ category: 1, status: 1 }),
    Listing.createIndex({ status: 1, category: 1, createdAt: -1 }),
    Listing.createIndex({ title: 'text', description: 'text' }),
  ]);

  console.log('Creating User indexes...');
  await Promise.all([
    User.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true }),
    User.createIndex({ email: 1 }, { unique: true }),
    User.createIndex({ role: 1 }),
    User.createIndex({ isBanned: 1 }),
  ]);

  console.log('Creating Log indexes...');
  await Promise.all([
    Log.createIndex({ createdAt: -1 }),
    Log.createIndex({ action: 1, createdAt: -1 }),
    Log.createIndex({ performedBy: 1 }),
  ]);

  console.log('Creating Report indexes...');
  await Promise.all([
    Report.createIndex({ status: 1, createdAt: -1 }),
    Report.createIndex({ listing: 1 }),
    Report.createIndex({ reportedBy: 1 }),
  ]);

  console.log('Creating Category indexes...');
  await Promise.all([
    Category.createIndex({ slug: 1 }, { unique: true }),
    Category.createIndex({ order: 1 }),
  ]);

  console.log('✅ All indexes created successfully');
  await mongoose.disconnect();
  process.exit(0);
}

createIndexes().catch(err => {
  console.error('❌ Index creation failed:', err);
  process.exit(1);
});
