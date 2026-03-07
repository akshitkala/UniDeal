import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";
import { requireSuperadmin } from "@/middleware/auth";

export async function POST(req: Request) {
    try {
        const auth = await requireSuperadmin();
        if (auth instanceof NextResponse) return auth;

        await connectDB();
        const body = await req.json();
        const { name, slug, icon, order } = body;

        if (!name || !slug || !icon) {
            return NextResponse.json({ error: "Name, slug, and icon are required" }, { status: 400 });
        }

        // Check if slug already exists
        const existing = await Category.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: "Category slug already exists" }, { status: 400 });
        }

        const category = await Category.create({
            name,
            slug,
            icon,
            order: order || 0,
            isActive: true
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error("POST Category Error:", error);
        return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
}
