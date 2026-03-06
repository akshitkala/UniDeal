import { connectDB } from '@/lib/db/connect';
import { AdminActivity } from '@/models/AdminActivity';

interface LogActionParams {
    actor?: string;
    actorType?: 'user' | 'system' | 'deleted_user';
    target?: string;
    targetModel?: 'User' | 'Listing' | 'Category' | 'System';
    action: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
}

export async function logAction(params: LogActionParams): Promise<void> {
    try {
        await connectDB();
        const ip = params.ipAddress ?? 'unknown';
        // Mask last octet of IPv4 addresses
        const maskedIp = ip.replace(/(\d+)$/, 'x');
        await AdminActivity.create({
            actor: params.actor,
            actorType: params.actorType ?? 'user',
            target: params.target,
            targetModel: params.targetModel,
            action: params.action,
            metadata: params.metadata ?? {},
            ipAddress: maskedIp,
        });
    } catch (err) {
        console.error('[logAction] Failed to log action:', err);
        // never throw — logging must never break the main request
    }
}
