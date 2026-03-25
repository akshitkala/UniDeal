import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { Category } from "@/models/Category";

import { getCache, setCache } from '@/lib/db/cache/memory-cache';

export async function GET() {
    const CACHE_KEY = 'categories:all';

    try {
        // Check memory cache first
        const cached = getCache<any[]>(CACHE_KEY);
        if (cached) {
            return NextResponse.json(
                { categories: cached },
                { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
            );
        }

        await connectDB();
        const categories = await Category.find({ isActive: true })
            .select('name slug icon order')
            .sort({ order: 1 })
            .lean();

        // Store in memory cache for 5 minutes
        setCache(CACHE_KEY, categories, 300);

        return NextResponse.json(
            { categories },
            { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
        );
    } catch (error) {
        console.error("GET Categories Error:", error);
        return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
    }
}

