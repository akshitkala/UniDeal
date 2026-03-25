import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";

export async function GET() {
    try {
        await connectDB();
        const categories = await Category.find({ isActive: true })
            .select("name slug icon order")
            .sort({ order: 1, name: 1 })
            .lean();

        return NextResponse.json({ categories }, {
            headers: {
                'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
            },
        });
    } catch (error) {
        console.error("GET Categories Error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}
