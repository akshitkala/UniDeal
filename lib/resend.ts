import { Resend } from 'resend';

/**
 * Server-only Resend client.
 * Spec: TRD §5.12, rules.md §3
 * Never import or expose to Client Components.
 */

if (typeof window !== 'undefined') {
  throw new Error('CRITICAL SECURITY ERROR: lib/resend.ts imported in a client environment.');
}

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable.');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}
