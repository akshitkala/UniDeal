export interface WhatsAppLinkInput {
  phone: string;           // E.164, server-side only
  title: string;
  price: number;
  slug: string;
  buyerFirstName: string;  // MUST come from firstName() in lib/display-name.ts
  siteUrl?: string;
}

/**
 * WhatsApp deep link builder.
 * TRD §5.5: Generates a wa.me deep link with pre-filled message.
 * Embeds phone into URL; raw phone number must never be returned as a standalone field.
 */
export function buildWhatsAppLink(input: WhatsAppLinkInput): string {
  const cleanPhone = input.phone.replace(/\D/g, '');

  const titleChars = Array.from(input.title);
  const shortTitle = titleChars.length > 60
    ? `${titleChars.slice(0, 59).join('')}…`
    : input.title;

  const baseMessage = `Hi, I'm ${input.buyerFirstName}. I found your "${shortTitle}" (₹${input.price}) on UniDeal and I'm interested. Is it still available?`;

  const siteUrl = (
    input.siteUrl?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://unideal.in'
  ).replace(/\/+$/, '');

  const productUrl = `${siteUrl}/listing/${input.slug}`;
  const message = `${baseMessage}\n\nProduct link: ${productUrl}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

