import { customAlphabet } from 'nanoid';

// 5-character lowercase alphanumeric nanoid generator
const generateNanoId = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 5);

/**
 * Generates a clean URL slug from title and a 5-character nanoid suffix.
 * e.g., "Study Lamp" -> "study-lamp-x7f2a"
 * Spec: TRD §2.3
 */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except space and hyphen
    .replace(/[\s_-]+/g, '-') // collapse whitespace and underscores into single hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .slice(0, 50); // limit base length

  const suffix = generateNanoId();
  return base ? `${base}-${suffix}` : `listing-${suffix}`;
}
