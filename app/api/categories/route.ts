import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find().sort({ order: 1 });
        return NextResponse.json({ categories });
    } catch (error) {
        console.error("GET Categories Error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
