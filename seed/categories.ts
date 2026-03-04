import mongoose from "mongoose";
import "dotenv/config";
import { Category } from "../models/Category";

const categories = [
    { name: "Electronics", slug: "electronics", icon: "laptop", order: 1 },
    { name: "Books", slug: "books", icon: "book", order: 2 },
    { name: "Furniture", slug: "furniture", icon: "chair", order: 3 },
    { name: "Clothing", slug: "clothing", icon: "shirt", order: 4 },
    { name: "Sports", slug: "sports", icon: "dumbbell", order: 5 },
    { name: "Vehicles", slug: "vehicles", icon: "car", order: 6 },
    { name: "Other", slug: "other", icon: "tag", order: 7 },
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
