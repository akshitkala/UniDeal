// Blocks: <script> tags, javascript: protocol, event handlers, MongoDB $ operators
const INJECTION_PATTERNS = [
  /<script[\s\S]*?>/gi,
  /<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,           // onclick=, onload=, onerror= etc
  /\$where/gi,             // MongoDB $where injection
  /\$gt|\$lt|\$ne|\$in|\$nin|\$or|\$and|\$not|\$nor|\$exists|\$regex/gi, // NoSQL operators
  /\{\s*\$/, // any object starting with $
  /<iframe/gi,
  /<img[^>]+onerror/gi,
  /data:text\/html/gi,
  /vbscript:/gi,
];

export function containsInjection(value: string): boolean {
  return INJECTION_PATTERNS.some(pattern => {
    const res = pattern.test(value);
    pattern.lastIndex = 0; // reset regex state for reuse
    return res;
  });
}

export function sanitizeInput(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')     // strip all HTML tags
    .replace(/\$/g, '')           // strip $ signs (NoSQL operators)
    .trim();
}

// Validate a single field — returns error string or null
export function validateField(
  name: string,
  value: string | number | undefined,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    patternMessage?: string;
    noInjection?: boolean;
  }
): string | null {

  const str = String(value ?? '').trim();

  if (rules.required && !str) return `${name} is required`;

  if (str && rules.noInjection !== false && containsInjection(str)) {
    return `${name} contains invalid characters`;
  }

  if (str && rules.minLength && str.length < rules.minLength) {
    return `${name} must be at least ${rules.minLength} characters`;
  }

  if (str && rules.maxLength && str.length > rules.maxLength) {
    return `${name} must be under ${rules.maxLength} characters`;
  }

  if (value !== undefined && value !== '' && rules.min !== undefined && Number(value) < rules.min) {
    return `${name} cannot be less than ${rules.min}`;
  }

  if (value !== undefined && value !== '' && rules.max !== undefined && Number(value) > rules.max) {
    return `${name} cannot be more than ${rules.max}`;
  }

  if (str && rules.pattern && !rules.pattern.test(str)) {
    return rules.patternMessage ?? `${name} format is invalid`;
  }

  return null;
}

// Validate entire form object — returns map of field → error
export function validateForm(
  fields: Record<string, {
    value: string | number | undefined;
    rules: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: RegExp;
        patternMessage?: string;
        noInjection?: boolean;
      };
  }>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [name, { value, rules }] of Object.entries(fields)) {
    const error = validateField(name, value, rules);
    if (error) errors[name] = error;
  }
  return errors;
}

// Reusable inline rules
export const FIELD_RULES = {
  title: { required: true, minLength: 3, maxLength: 100, noInjection: true },
  description: { required: true, minLength: 10, maxLength: 2000, noInjection: true },
  price: { required: true, min: 0, max: 1000000 },
  name: { required: true, minLength: 2, maxLength: 100, noInjection: true },
  whatsapp: {
    pattern: /^\d{10,15}$/,
    patternMessage: 'WhatsApp must be 10–15 digits, no spaces or symbols',
  },
  search: { maxLength: 100, noInjection: true },
  categoryName: { required: true, minLength: 2, maxLength: 50, noInjection: true },
  reason: { maxLength: 500, noInjection: true },
};
