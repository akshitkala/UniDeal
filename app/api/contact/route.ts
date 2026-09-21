import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation/contact';
import { getResendClient } from '@/lib/resend';

/**
 * POST /api/contact — Support contact form (TRD §5.12)
 * Unauthenticated. No rate limit. No contact_reveals logging.
 * Entirely separate from the seller-contact flow.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: 'Invalid request body.' } },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input.';
    return NextResponse.json(
      { error: { message: firstError, code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const { name, email, message } = parsed.data;

  try {
    const resend = getResendClient();
    await resend.emails.send({
      from: 'UniDeal Contact <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL ?? 'support@unideal.app',
      replyTo: email,
      subject: `UniDeal — message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });
  } catch (err) {
    console.error('[/api/contact] Resend error:', err);
    return NextResponse.json(
      { error: { message: "Couldn't send your message. Please try again later.", code: 'SEND_FAILED' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { sent: true } });
}
