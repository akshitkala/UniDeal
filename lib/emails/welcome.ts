import { resend } from '@/lib/resend';
import { baseTemplate, heading, subtext, button, divider } from './templates';

export async function sendWelcomeEmail({
    to,
    name,
}: {
    to: string;
    name: string;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unideal.vercel.app';
    const firstName = name.split(' ')[0];

    const content = `
    ${heading(`Welcome to UniDeal, ${firstName}! 👋`)}
    ${subtext("You're now part of LPU's campus marketplace. Buy and sell second-hand items with fellow students — no middlemen, no shipping, just campus.")}

    ${divider()}

    <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#1a1814;">What you can do:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f3ef;">
          <span style="font-size:18px;">📦</span>
          <span style="font-size:14px;color:#2d2a26;margin-left:10px;font-weight:600;">List your items</span>
          <p style="margin:4px 0 0 28px;font-size:13px;color:#7a7570;">Sell textbooks, electronics, furniture and more</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f3ef;">
          <span style="font-size:18px;">🔍</span>
          <span style="font-size:14px;color:#2d2a26;margin-left:10px;font-weight:600;">Browse listings</span>
          <p style="margin:4px 0 0 28px;font-size:13px;color:#7a7570;">Find great deals from students on campus</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <span style="font-size:18px;">💬</span>
          <span style="font-size:14px;color:#2d2a26;margin-left:10px;font-weight:600;">Contact via WhatsApp</span>
          <p style="margin:4px 0 0 28px;font-size:13px;color:#7a7570;">Connect directly with buyers and sellers</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 20px;font-size:13px;color:#7a7570;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;">
      💡 <strong>Tip:</strong> Add your WhatsApp number in your profile so buyers can reach you instantly.
    </p>

    ${divider()}

    ${button('Browse Listings →', siteUrl)}
  `;

    try {
        await resend.emails.send({
            from: 'UniDeal <onboarding@resend.dev>',
            to,
            subject: `Welcome to UniDeal, ${firstName}! 🎉`,
            html: baseTemplate(content),
        });
    } catch (err) {
        console.error('Welcome email failed:', err);
        // Never throw — email failure must never break signup
    }
}
