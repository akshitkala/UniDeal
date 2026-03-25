import { cache } from 'react';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/models/User';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';

/**
 * cache() memoizes this function per request.
 * No matter how many times getAuthUser() is called in one request,
 * the DB is only queried once.
 */
export const getAuthUser = cache(async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        if (!token) return null;

        const payload = verifyAccessToken(token);
        if (!payload) return null;

        await connectDB();
        const user = await User.findOne({ uid: payload.uid })
            .select('_id uid email emailVerified role isActive trustLevel')
            .lean();

        if (user && !user.isActive) return null;

        return user;
    } catch (error) {
        return null;
    }
});
