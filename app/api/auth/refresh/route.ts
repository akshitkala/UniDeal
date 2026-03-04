import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("refresh_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "No refresh token" }, { status: 401 });
        }

        const payload = verifyRefreshToken(token);

        const newPayload = {
            uid: payload.uid,
            email: payload.email,
            emailVerified: payload.emailVerified,
            role: payload.role,
        };

        const accessToken = signAccessToken(newPayload);

        cookieStore.set({
            name: "access_token",
            value: accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 900,
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (err: any) {
        if (err instanceof Response) return err;
        return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }
}
