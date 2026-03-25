import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { requireSuperadmin } from "@/middleware/auth";
import { Listing } from "@/models/Listing";
import { User } from "@/models/User";
import { Report } from "@/models/Report";

import { StatsRepository } from "@/lib/db/repositories/stats.repository";

export async function GET(req: NextRequest) {
    try {
        const superOrResponse = await requireSuperadmin();
        if (superOrResponse instanceof NextResponse) return superOrResponse;

        await connectDB();
        const stats = await StatsRepository.getPlatformStats();

        return NextResponse.json(stats);
    } catch (error) {
        console.error("GET Super-admin Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
