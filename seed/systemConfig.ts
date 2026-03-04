import mongoose from "mongoose";
import "dotenv/config";
import { SystemConfig } from "../models/SystemConfig";

async function seedConfig() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not set");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        await SystemConfig.findOneAndUpdate(
            { _id: "global" },
            {
                approvalMode: "automatic",
                maintenanceMode: false,
                allowNewListings: true,
            },
            { upsert: true, new: true }
        );

        console.log("SystemConfig seeded successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding config:", error);
        process.exit(1);
    }
}

seedConfig();
