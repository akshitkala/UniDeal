import { resend } from '@/lib/resend';
import { baseTemplate, heading, subtext, button, divider } from './templates';

export async function sendRejectionEmail({
    to,
    sellerName,
    listingTitle,
    listingPrice,
    listingCondition,
    rejectionReason,
    listingSlug,
}: {
    to: string;
    sellerName: string;
    listingTitle: string;
    listingPrice: number;
    listingCondition: string;
    rejectionReason: string;
    listingSlug: string;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://unideal.vercel.app';
    const dashboardUrl = `${siteUrl}/dashboard`;
    const firstName = sellerName.split(' ')[0];

    const content = `
    ${heading(`Your listing wasn't approved, ${firstName}`)}
    ${subtext("Our team reviewed your listing and found an issue. Don't worry — you can edit it and resubmit.")}

    ${divider()}

    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#7a7570;text-transform:uppercase;letter-spacing:0.05em;">Your Listing</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e8e4de;border-radius:10px;overflow:hidden;">
      <tr>
        <td style="padding:16px;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1a1814;">${listingTitle}</p>
          <p style="margin:0;font-size:13px;color:#7a7570;">${listingCondition} condition · ₹${listingPrice.toLocaleString('en-IN')}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#7a7570;text-transform:uppercase;letter-spacing:0.05em;">Reason for Rejection</p>

    <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:10px;padding:16px;margin-bottom:24px;">
      <p style="margin:0;font-size:14px;color:#b91c1c;line-height:1.6;">
        ⚠️ ${rejectionReason}
      </p>
    </div>

    <p style="margin:0 0 20px;font-size:14px;color:#4a4640;line-height:1.6;">
      To get your listing approved, go to your dashboard, click <strong>Edit</strong> on the listing, fix the issue mentioned above, and resubmit. Our team will review it again.
    </p>

    ${divider()}

    ${button('Go to My Dashboard →', dashboardUrl)}

    <p style="margin:16px 0 0;font-size:12px;color:#a8a39d;">
      If you think this rejection was a mistake, please contact us by replying to this email.
    </p>
  `;

    try {
        await resend.emails.send({
            from: 'UniDeal <onboarding@resend.dev>',
            to,
            subject: `Your listing "${listingTitle}" was not approved`,
            html: baseTemplate(content),
        });
    } catch (err) {
        console.error('Rejection email failed:', err);
        // Never throw — email failure must never break the rejection flow
    }
}
