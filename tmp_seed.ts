import mongoose from 'mongoose';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/models/User';
import { Category } from '@/models/Category';
import { Listing } from '@/models/Listing';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seed() {
    await connectDB();
    console.log('Connected to database');

    const email = 'akshitkala72@gmail.com';
    const whatsapp = '+918532999600';

    // 1. Find or Update User
    let user = await User.findOne({ email });
    if (!user) {
        console.error(`User ${email} not found. Please log in first.`);
        process.exit(1);
    }

    user.whatsappNumber = whatsapp;
    await user.save();
    console.log(`Updated user ${email} with WhatsApp ${whatsapp}`);

    // 2. Get Categories
    const categories = await Category.find();
    if (categories.length === 0) {
        console.error('No categories found. Seed categories first.');
        process.exit(1);
    }

    // 3. Delete all existing listings
    const delResult = await Listing.deleteMany({});
    console.log(`Deleted ${delResult.deletedCount} existing listings.`);

    // 4. Seed 20 diverse listings
    const dummyItems = [
        { title: 'iPhone 13 Pro - Graphite', price: 45000, cat: 'Electronics', cond: 'like-new' },
        { title: 'Mechanical Keyboard (Blue Switches)', price: 1200, cat: 'Electronics', cond: 'good' },
        { title: 'Engineering Physics Textbook', price: 400, cat: 'Books', cond: 'used' },
        { title: 'Electric Kettle 1.5L', price: 800, cat: 'Electronics', cond: 'new' },
        { title: 'Study Table (Wooden)', price: 1500, cat: 'Furniture', cond: 'good' },
        { title: 'Nike Air Max 270', price: 3200, cat: 'Fashion', cond: 'used' },
        { title: 'Gaming Mouse - Razer', price: 2100, cat: 'Electronics', cond: 'like-new' },
        { title: 'Canvas Painting (Abstract)', price: 600, cat: 'Others', cond: 'new' },
        { title: 'Scientific Calculator Casio', price: 900, cat: 'Others', cond: 'good' },
        { title: 'Backpack for Laptop', price: 700, cat: 'Fashion', cond: 'used' },
        { title: 'Acoustic Guitar - Vault', price: 4500, cat: 'Others', cond: 'good' },
        { title: 'Yoga Mat (6mm)', price: 350, cat: 'Others', cond: 'new' },
        { title: 'Bluetooth Speaker - Boat', price: 1100, cat: 'Electronics', cond: 'good' },
        { title: 'Denim Jacket (Large)', price: 950, cat: 'Fashion', cond: 'like-new' },
        { title: 'Floor Lamp', price: 1800, cat: 'Furniture', cond: 'new' },
        { title: 'Psychology of Money (Hardcover)', price: 300, cat: 'Books', cond: 'new' },
        { title: 'Power Bank 20000mAh', price: 1400, cat: 'Electronics', cond: 'good' },
        { title: 'Gym Dumbbells 2.5kg x 2', price: 500, cat: 'Others', cond: 'used' },
        { title: 'Office Chair (Ergonomic)', price: 4200, cat: 'Furniture', cond: 'like-new' },
        { title: 'Smart Watch - Noise', price: 2500, cat: 'Electronics', cond: 'new' },
    ];

    const listingsToCreate = dummyItems.map((item, i) => {
        // Find matching category or fallback to first
        const category = categories.find(c => c.name.toLowerCase().includes(item.cat.toLowerCase())) || categories[0];

        return {
            title: item.title,
            description: `This is a high-quality ${item.title.toLowerCase()} in ${item.cond} condition. Perfect for students on campus. Contact me for more details.`,
            price: item.price,
            negotiable: i % 2 === 0,
            category: category._id,
            condition: item.cond,
            images: [`https://picsum.photos/seed/${i + 100}/800/600`],
            seller: user._id,
            sellerWhatsapp: whatsapp,
            sellerEmail: email,
            location: 'Hostel 5, LPU',
            status: 'approved',
            views: Math.floor(Math.random() * 100),
            createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000) // Random date in last 10 days
        };
    });

    await Listing.insertMany(listingsToCreate);
    console.log('Successfully seeded 20 fresh listings!');

    process.exit(0);
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
