import { NextRequest, NextResponse } from 'next/server';
import admin from '@/lib/auth/firebaseAdmin';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/models/User';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const firebaseIdToken = body?.firebaseIdToken;

        if (!firebaseIdToken) {
            return NextResponse.json({ error: 'No token provided' }, { status: 400 });
        }

        const decoded = await admin.auth().verifyIdToken(firebaseIdToken);

        await connectDB();

        let user = await User.findOne({ uid: decoded.uid });
        const isNewUser = !user;

        if (!user) {
            user = await User.create({
                uid: decoded.uid,
                email: decoded.email!,
                emailVerified: true,
                displayName: decoded.name ?? '',
                photoUrl: decoded.picture ?? '',
            });
        } else {
            user.emailVerified = true;
            user.displayName = decoded.name ?? user.displayName;
            user.photoUrl = decoded.picture ?? user.photoUrl;
            await user.save();
        }

        if (isNewUser) {
            import('@/lib/emails/welcome').then(({ sendWelcomeEmail }) => {
                sendWelcomeEmail({
                    to: decoded.email!,
                    name: decoded.name ?? 'Student',
                }).catch(() => { });
            }).catch(() => { });
        }

        if (!user.isActive) {
            return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
        }

        const payload = {
            uid: user.uid,
            email: user.email,
            emailVerified: true,
            role: user.role,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        const response = NextResponse.json({ user: payload });

        response.cookies.set('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 15,
            path: '/',
        });

        response.cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        return response;

    } catch (err: any) {
        console.error('Login error:', err);
        return NextResponse.json({ error: err.message ?? 'Internal server error' }, { status: 500 });
    }
}
