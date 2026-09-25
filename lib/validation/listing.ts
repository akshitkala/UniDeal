import { z } from 'zod';

export const listingConditions = ['New', 'Like New', 'Good', 'Used', 'Damaged'] as const;

// Same E.164 pattern the Profile page validates client-side. Required here only
// when the seller has no whatsapp_number on file yet (enforced in POST /api/listings);
// still optional in general — Profile remains free to leave it blank (TRD §2.1a).
const whatsappNumberField = z
  .string()
  .min(1, 'WhatsApp number is required so buyers can contact you.')
  .regex(/^\+[1-9]\d{6,14}$/, 'Enter a valid number in E.164 format, e.g. +919876543210.');

export const createListingSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  price: z
    .number({ required_error: 'Price is required' })
    .nonnegative('Price cannot be negative'),
  negotiable: z.boolean().default(false),
  category_id: z
    .number({ required_error: 'Category is required' })
    .int('Invalid category ID'),
  condition: z.enum(listingConditions, {
    errorMap: () => ({ message: 'Please select a valid condition' }),
  }),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'Please upload at least 1 image')
    .max(4, 'Maximum 4 images allowed'),
  whatsapp_number: whatsappNumberField.optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

// whatsapp_number is not a listings column — never accepted on update.
export const updateListingSchema = createListingSchema
  .omit({ whatsapp_number: true })
  .partial();
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
