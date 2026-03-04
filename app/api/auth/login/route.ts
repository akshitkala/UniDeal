import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import admin from "@/lib/auth/firebaseAdmin";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
    try {
        const { firebaseIdToken } = await request.json();
        if (!firebaseIdToken) return NextResponse.json({ error: "No token provided" }, { status: 400 });

        const decodedToken = await admin.auth().verifyIdToken(firebaseIdToken);
        await connectDB();

        let user = await User.findOne({ uid: decodedToken.uid });

        if (!user) {
            user = await User.create({
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified || false,
                displayName: decodedToken.name,
                photoURL: decodedToken.picture,
            });
        } else {
            user.emailVerified = decodedToken.email_verified || false;
            await user.save();
        }

        if (user.isActive === false) {
            return NextResponse.json({ error: "Account suspended" }, { status: 403 });
        }

        const payload = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            role: user.role,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        const cookieStore = await cookies();
        cookieStore.set({
            name: "access_token",
            value: accessToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 900,
        });

        cookieStore.set({
            name: "refresh_token",
            value: refreshToken,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 604800,
        });

        return NextResponse.json({ user: payload }, { status: 200 });

    } catch (err: any) {
        if (err instanceof Response) return err;
        console.error("Login Error:", err);
        return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
    }
}
