import { NextRequest, NextResponse } from 'next/server';
import { contactSchema } from '@/lib/validation/contact';
import { getResendClient } from '@/lib/resend';

const clean = (s: string) => s.replace(/[\r\n]+/g, ' ').trim();

/**
 * POST /api/contact — Support contact form (TRD §5.12)
 * Unauthenticated. No rate limit. No contact_reveals logging.
 * Entirely separate from the seller-contact flow.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch (err) {
    console.error('[/api/contact] Failed to parse request JSON:', err);
    return NextResponse.json(
      { error: { message: 'Invalid request body.', code: 'INVALID_JSON' } },
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
    const receivedTime = `${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;
    const textBody = [
      `Name: ${clean(name)}`,
      `Email: ${email}`,
      `Received: ${receivedTime}`,
      '',
      'Message:',
      message,
      '',
      '—',
      'Reply directly to this email to respond to the sender.',
    ].join('\n');

    await resend.emails.send({
      from: 'UniDeal Contact <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL ?? 'support@unideal.app',
      replyTo: email,
      subject: `[UniDeal Support] Message from ${clean(name)}`,
      text: textBody,
    });
  } catch (err) {
    console.error('[/api/contact] Resend error:', err);
    return NextResponse.json(
      { error: { message: "Couldn't send your message. Please try again in a moment.", code: 'SEND_FAILED' } },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: { sent: true } });
}
