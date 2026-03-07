import mongoose from "mongoose";
import "dotenv/config";
import { Category } from "../models/Category";

const categories = [
    { name: 'Books', slug: 'books', icon: '📚', order: 1, isActive: true },
    { name: 'Electronics', slug: 'electronics', icon: '💻', order: 2, isActive: true },
    { name: 'Furniture', slug: 'furniture', icon: '🪑', order: 3, isActive: true },
    { name: 'Clothing', slug: 'clothing', icon: '👕', order: 4, isActive: true },
    { name: 'Sports', slug: 'sports', icon: '⚽', order: 5, isActive: true },
    { name: 'Other', slug: 'other', icon: '📦', order: 6, isActive: true },
];

async function seedCategories() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        for (const cat of categories) {
            await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
        }

        console.log("Categories seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding categories:", error);
        process.exit(1);
    }
}

seedCategories();
