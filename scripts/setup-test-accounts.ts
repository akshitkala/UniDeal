import { connectDB } from '../lib/db/connect';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Listing } from '../models/Listing';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function setup() {
    await connectDB();

    // Ensure Categories exist
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
        console.log('Seeding categories...');
        const cats = [
            { name: 'Electronics', slug: 'electronics', icon: '💻', order: 1, isActive: true },
            { name: 'Books', slug: 'books', icon: '📚', order: 2, isActive: true },
            { name: 'Furniture', slug: 'furniture', icon: '🪑', order: 3, isActive: true },
            { name: 'Bicycles', slug: 'bicycles', icon: '🚲', order: 4, isActive: true },
            { name: 'Stationery', slug: 'stationery', icon: '✏️', order: 5, isActive: true },
            { name: 'Others', slug: 'others', icon: '📦', order: 6, isActive: true },
        ];
        await Category.insertMany(cats);
    }

    // Setup Test Accounts
    const accounts = [
        { email: 'test-buyer@unideal.in', displayName: 'Test Buyer', role: 'user', uid: 'test-buyer-uid' },
        { email: 'akshitkala72@gmail.com', displayName: 'Akshit Kala', role: 'user', uid: 'seller-uid', whatsapp: '8532999600' },
        { email: 'superadmin@unideal.in', displayName: 'Super Admin', role: 'superadmin', uid: 'superadmin-uid' }
    ];

    for (const acc of accounts) {
        let user = await User.findOne({ email: acc.email });
        if (!user) {
            console.log(`Creating user: ${acc.email}`);
            await User.create(acc);
        } else {
            console.log(`Updating user: ${acc.email}`);
            user.role = acc.role;
            if (acc.whatsapp) user.whatsapp = acc.whatsapp;
            await user.save();
        }
    }

    console.log('Setup complete.');
    process.exit(0);
}

setup();
