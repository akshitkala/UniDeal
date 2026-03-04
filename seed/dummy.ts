import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { Category } from "../models/Category";
import { User } from "../models/User";
import { Listing } from "../models/Listing";

const dummyUsers = [
    {
        uid: "dummy-user-1",
        email: "student1@lpu.in",
        emailVerified: true,
        displayName: "Arjun Sharma",
        role: "user",
        trustLevel: "trusted",
    },
    {
        uid: "dummy-user-2",
        email: "student2@lpu.in",
        emailVerified: true,
        displayName: "Priya Singh",
        role: "user",
        trustLevel: "new",
    },
    {
        uid: "admin-user",
        email: "admin@unideal.in",
        emailVerified: true,
        displayName: "System Admin",
        role: "admin",
        trustLevel: "trusted",
    }
];

const listingsData = [
    {
        title: "iPhone 13 - Mint Condition",
        description: "Selling my iPhone 13, 128GB. No scratches, used with case and screen protector from day 1. Battery health 89%.",
        price: 32000,
        condition: "like-new",
        categorySlug: "electronics",
        images: ["https://picsum.photos/id/160/800/600"],
    },
    {
        title: "Calculus Early Transcendentals - Stewart",
        description: "Essential for 1st year engineering. Some highlight marks but otherwise good condition.",
        price: 450,
        condition: "good",
        categorySlug: "books",
        images: ["https://picsum.photos/id/24/800/600"],
    },
    {
        title: "Study Table (Wooden)",
        description: "Sturdy wooden table for dorm rooms. Width 3ft, height standard. Selling because I am graduating.",
        price: 1200,
        condition: "used",
        categorySlug: "furniture",
        images: ["https://picsum.photos/id/20/800/600"],
    },
    {
        title: "KTM RC 200 - low mileage",
        description: "2021 model, 5000km driven. Just had its first service. Well maintained, parking in shed.",
        price: 150000,
        condition: "like-new",
        categorySlug: "vehicles",
        images: ["https://picsum.photos/id/111/800/600"],
    }
];

async function seed() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        // 1. Seed Categories (ensure they exist)
        const categories = [
            { name: "Electronics", slug: "electronics", icon: "laptop", order: 1 },
            { name: "Books", slug: "books", icon: "book", order: 2 },
            { name: "Furniture", slug: "furniture", icon: "chair", order: 3 },
            { name: "Clothing", slug: "clothing", icon: "shirt", order: 4 },
            { name: "Sports", slug: "sports", icon: "dumbbell", order: 5 },
            { name: "Vehicles", slug: "vehicles", icon: "car", order: 6 },
            { name: "Other", slug: "other", icon: "tag", order: 7 },
        ];

        for (const cat of categories) {
            await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
        }
        console.log("Categories checked/seeded.");

        // 2. Seed Users
        const createdUsers = [];
        for (const userData of dummyUsers) {
            const user = await User.findOneAndUpdate({ uid: userData.uid }, userData, { upsert: true, new: true });
            createdUsers.push(user);
        }
        console.log("Dummy users seeded.");

        // 3. Seed Listings
        await Listing.deleteMany({ sellerEmail: { $in: dummyUsers.map(u => u.email) } });

        for (let i = 0; i < listingsData.length; i++) {
            const data = listingsData[i];
            const category = await Category.findOne({ slug: data.categorySlug });
            const seller = createdUsers[i % 2]; // Alternate between the two student users

            await Listing.create({
                ...data,
                category: category?._id,
                seller: seller._id,
                sellerEmail: seller.email,
                status: "approved",
                views: Math.floor(Math.random() * 50),
                createdAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7) // Last 7 days
            });
        }

        console.log("Dummy listings seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding dummy data:", error);
        process.exit(1);
    }
}

seed();
