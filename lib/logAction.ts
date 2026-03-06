import { connectDB } from '@/lib/db/connect';
import { AdminActivity } from '@/models/AdminActivity';

interface LogActionParams {
    actor?: string;           // MongoDB ObjectId string OR uid string
    actorType?: 'user' | 'system' | 'deleted_user';
    target?: string;
    targetModel?: 'User' | 'Listing' | 'Category' | 'System';
    action: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
}

function maskIp(ip: string): string {
    if (!ip || ip === 'unknown') return 'unknown';
    // IPv4: mask last octet  → 192.168.1.x
    if (ip.includes('.')) return ip.replace(/\.\d+$/, '.x');
    // IPv6: mask last segment → 2001:db8::x
    if (ip.includes(':')) return ip.replace(/:[^:]+$/, ':x');
    return ip;
}

export async function logAction(params: LogActionParams): Promise<void> {
    try {
        await connectDB();
        const maskedIp = maskIp(params.ipAddress ?? 'unknown');

        await AdminActivity.create({
            actor:       params.actor,
            actorType:   params.actorType ?? 'user',
            target:      params.target,
            targetModel: params.targetModel ?? 'System',
            action:      params.action,
            metadata:    params.metadata ?? {},
            ipAddress:   maskedIp,
        });
    } catch (err) {
        console.error('[logAction] Failed to log action:', err);
        // never throw — logging must never break the main request
    }
}
