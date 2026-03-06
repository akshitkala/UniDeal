import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('refresh_token')?.value;
        if (!token) return NextResponse.json({ error: 'No refresh token' }, { status: 401 });

        const payload = verifyRefreshToken(token);
        const newAccess = signAccessToken({
            uid: payload.uid,
            email: payload.email,
            emailVerified: payload.emailVerified,
            role: payload.role,
        });

        const res = NextResponse.json({ success: true });
        res.cookies.set('access_token', newAccess, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 15,
            path: '/',
        });
        return res;
    } catch {
        return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }
}
