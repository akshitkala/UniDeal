/**
 * scripts/reset-for-production.ts
 *
 * Wipes all dummy/test data and leaves the DB in a clean state ready for production.
 * Run ONCE before go-live: npx tsx --tsconfig tsconfig.json --env-file=.env.local scripts/reset-for-production.ts
 *
 * What it deletes:
 *  - ALL Listings
 *  - ALL Users
 *  - ALL AdminActivity logs
 *  - ALL Reports
 *
 * What it keeps:
 *  - Categories (curated, not user-generated)
 *  - SystemConfig (global settings)
 */
import { connectDB } from '../lib/db/connect';
import { Listing } from '../models/Listing';
import { User } from '../models/User';
import { AdminActivity } from '../models/AdminActivity';
import { Category } from '../models/Category';
import { SystemConfig } from '../models/SystemConfig';

async function resetForProduction() {
    console.log('\n🚀 UniDeal — Production Reset Script');
    console.log('='.repeat(50));
    console.log('⚠️  This will permanently delete all listings, users, and logs.');
    console.log('    Categories and SystemConfig will be preserved.\n');

    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    // --- Delete Listings ---
    const listingResult = await Listing.deleteMany({});
    console.log(`🗑  Deleted ${listingResult.deletedCount} listings`);

    // --- Delete Users ---
    const userResult = await User.deleteMany({});
    console.log(`🗑  Deleted ${userResult.deletedCount} users`);

    // --- Delete Admin Activity Logs ---
    const logResult = await AdminActivity.deleteMany({});
    console.log(`🗑  Deleted ${logResult.deletedCount} activity log entries`);

    // --- Reset SystemConfig to production-safe defaults ---
    await SystemConfig.findOneAndUpdate(
        { _id: 'global' },
        {
            $set: {
                maintenanceMode: false,
                allowNewListings: true,
                approvalMode: 'manual',  // safe default: human review for all new listings
                maxListingsPerUser: 10,
            }
        },
        { upsert: true }
    );
    console.log('✅ SystemConfig reset to production-safe defaults');

    // --- Summary ---
    const categoryCount = await Category.countDocuments();
    console.log(`\n📦 Categories preserved: ${categoryCount}`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ Database is clean and ready for production.');
    console.log('='.repeat(50));
    console.log('\nNext steps:');
    console.log('  1. Set NEXT_PUBLIC_SITE_URL to your Vercel URL in Vercel env vars');
    console.log('  2. Remove the debug routes: app/api/debug/ (already done in this session)');
    console.log('  3. Push to main and trigger a Vercel deploy\n');

    process.exit(0);
}

resetForProduction().catch(e => {
    console.error('\n❌ Reset failed:', e.message);
    process.exit(1);
});
