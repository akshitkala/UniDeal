import { z } from 'zod';

export const listingConditions = ['New', 'Like New', 'Good', 'Used', 'Damaged'] as const;

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
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingSchema = createListingSchema.partial();
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
