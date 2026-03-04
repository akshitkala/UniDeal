import { NextResponse } from "next/server";
import { verifyAccessToken, TokenPayload } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

type AllowedRoles = "user" | "admin" | "superadmin";

export async function requireAuth(): Promise<TokenPayload | NextResponse> {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const payload = verifyAccessToken(token);
        return payload;
    } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}

export async function requireVerified(): Promise<TokenPayload | NextResponse> {
    const userOrResponse = await requireAuth();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    if (!userOrResponse.emailVerified) {
        return NextResponse.json({ error: "Email verification required" }, { status: 403 });
    }

    return userOrResponse;
}

export async function requireRole(allowedRoles: AllowedRoles[]): Promise<TokenPayload | NextResponse> {
    const userOrResponse = await requireAuth();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    if (!allowedRoles.includes(userOrResponse.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return userOrResponse;
}

export async function requireAdmin(): Promise<TokenPayload | NextResponse> {
    return requireRole(["admin", "superadmin"]);
}

export async function requireSuperadmin(): Promise<TokenPayload | NextResponse> {
    return requireRole(["superadmin"]);
}

export async function requireOwnership(sellerUid: string): Promise<TokenPayload | NextResponse> {
    const userOrResponse = await requireAuth();
    if (userOrResponse instanceof NextResponse) return userOrResponse;

    if (userOrResponse.uid !== sellerUid && userOrResponse.role !== "admin" && userOrResponse.role !== "superadmin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return userOrResponse;
}
