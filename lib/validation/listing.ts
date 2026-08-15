import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters.")
    .max(100, "Title must be 100 characters or less."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(1000, "Description must be 1000 characters or less."),
  price: z.coerce
    .number()
    .min(0, "Price must be 0 or more."),
  negotiable: z.boolean().default(false),
  category_id: z.coerce
    .number({
      message: "Please select a category.",
    })
    .int()
    .positive("Please select a category."),
  condition: z.enum(["New", "Like New", "Good", "Used", "Damaged"], {
    message: "Please select a condition.",
  }),
  images: z
    .array(z.string().url("Invalid image URL."))
    .min(1, "Add at least one image.")
    .max(4, "You can upload up to 4 images."),
});

export type ListingFormValues = z.infer<typeof listingSchema>;
