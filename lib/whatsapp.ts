/**
 * WhatsApp deep link builder.
 * TRD §5.5: Generates a wa.me deep link with pre-filled message.
 * Note: Phone number is embedded inside the URL only; raw phone number must never
 * be returned as a standalone field in API responses.
 */
export function buildWhatsAppLink(whatsappNumber: string, listingTitle: string): string {
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  const message = `Hi! I'm interested in your listing "${listingTitle}" on UniDeal.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
