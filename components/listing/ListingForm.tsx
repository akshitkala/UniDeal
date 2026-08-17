"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState, useTransition } from "react";

import { getCloudinaryUploadConfig, getCloudinaryUploadUrl } from "@/lib/cloudinary";
import { listingSchema, type ListingFormValues } from "@/lib/validation/listing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
};

type ListingData = {
  id: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  category_id: number;
  condition: string;
  images: string[];
};

type ListingFormProps = {
  categories: CategoryOption[];
  initialData?: ListingData;
};

export function ListingForm({ categories, initialData }: ListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price !== undefined ? String(initialData.price) : "");
  const [negotiable, setNegotiable] = useState(initialData?.negotiable || false);
  const [categoryId, setCategoryId] = useState(initialData?.category_id !== undefined ? String(initialData.category_id) : "");
  const [condition, setCondition] = useState(initialData?.condition || "");
  
  // Image upload states
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Field validation error states
  const [errors, setErrors] = useState<Partial<Record<keyof ListingFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Direct browser-to-Cloudinary upload
  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setImageError(null);
    setUploading(true);

    const newImages = [...images];
    const totalSelected = files.length;
    
    if (newImages.length + totalSelected > 4) {
      setImageError("You can upload up to 4 images.");
      setUploading(false);
      return;
    }

    try {
      const config = getCloudinaryUploadConfig();
      const uploadUrl = getCloudinaryUploadUrl();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Client-side file size check
        if (file.size > MAX_FILE_SIZE) {
          setImageError(`"${file.name}" is larger than 5MB and was rejected.`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", config.uploadPreset);

        const response = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image.");
        }

        const data = await response.json();
        if (data.secure_url) {
          newImages.push(data.secure_url);
        }
      }

      setImages(newImages);
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      setImageError("Couldn't upload image. Check Cloudinary settings or try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleRemoveImage(indexToRemove: number) {
    setImages(images.filter((_, index) => index !== indexToRemove));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    setFormError(null);

    const payload = {
      title,
      description,
      price: price === "" ? undefined : Number(price),
      negotiable,
      category_id: categoryId === "" ? undefined : Number(categoryId),
      condition,
      images,
    };

    // Validate payload client-side with Zod
    const result = listingSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ListingFormValues, string>> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as keyof ListingFormValues] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setFormError("Couldn't post your listing. Check the highlighted fields and try again.");
      return;
    }

    startTransition(async () => {
      try {
        const url = initialData ? `/api/listings/${initialData.id}` : "/api/listings";
        const method = initialData ? "PATCH" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result.data),
        });

        const json = await response.json();

        if (!response.ok) {
          setFormError(json.error?.message || "Something went wrong. Please try again.");
          return;
        }

        const listingResult = json.data;

        if (initialData) {
          // Redirect to the listing detail page on update
          router.push(`/listing/${listingResult.slug}`);
        } else {
          // Redirect based on listing status on create
          if (listingResult.status === "approved") {
            router.push(`/listing/${listingResult.slug}`);
          } else {
            router.push("/dashboard");
          }
        }
        router.refresh();
      } catch (error) {
        console.error("Listing form submit error:", error);
        setFormError("Connection error. Could not reach server, please try again.");
      }
    });
  }

  return (
    <form className="max-w-2xl mx-auto space-y-8" onSubmit={handleSubmit}>
      {/* 1. Photos Section */}
      <section className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-heading text-text border-b pb-2">Photos</h2>
        
        <div className="space-y-2">
          <p className="font-body text-caption text-text-muted">
            Add 1 to 4 photos. Max 5MB per photo.
          </p>

          <div className="grid grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-background border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Listing upload ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white text-caption hover:bg-danger/80"
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}

            {images.length < 4 ? (
              <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors bg-background">
                <span className="text-display font-display font-light text-text-muted select-none group-hover:text-primary">
                  +
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : null}
          </div>

          {uploading ? (
            <p className="font-body text-caption text-primary">Uploading images to Cloudinary...</p>
          ) : null}

          {imageError ? (
            <p className="font-body text-caption text-danger">{imageError}</p>
          ) : null}

          {errors.images ? (
            <p className="font-body text-caption text-danger">{errors.images}</p>
          ) : null}
        </div>
      </section>

      {/* 2. Item Details Section */}
      <section className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-heading text-text border-b pb-2">Item details</h2>

        <Input
          id="title"
          label="Title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Study desk lamp, Engineering notes"
          error={errors.title}
        />

        <div className="space-y-2">
          <label className="block font-body text-caption text-text" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border bg-background px-4 py-3 font-body text-body text-text outline-none focus:border-primary placeholder:text-text-muted resize-none"
            placeholder="Describe the condition, features, or details of your item."
          />
          {errors.description ? (
            <p className="font-body text-caption text-danger">{errors.description}</p>
          ) : null}
        </div>
      </section>

      {/* 3. Pricing Section */}
      <section className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-heading text-text border-b pb-2">Pricing</h2>

        <div className="space-y-4">
          <Input
            id="price"
            label="Price (₹)"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 500"
            error={errors.price}
          />

          <div className="flex items-center space-x-2">
            <input
              id="negotiable"
              type="checkbox"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="negotiable" className="font-body text-body text-text select-none cursor-pointer">
              Price is negotiable
            </label>
          </div>
        </div>
      </section>

      {/* 4. Category & Condition Section */}
      <section className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-sm">
        <h2 className="font-display text-heading text-text border-b pb-2">Category and condition</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Select
            id="category_id"
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            error={errors.category_id}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Select
            id="condition"
            label="Condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            error={errors.condition}
          >
            <option value="">Select Condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Used">Used</option>
            <option value="Damaged">Damaged</option>
          </Select>
        </div>
      </section>

      {/* Submit and Feedback Zone */}
      <div className="space-y-4">
        {formError ? (
          <p className="rounded-md border border-danger/20 bg-danger/5 px-4 py-3 font-body text-caption text-danger">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          isLoading={isPending}
          disabled={uploading}
          className="w-full font-semibold"
        >
          {initialData ? "Save changes" : "Post listing"}
        </Button>
      </div>
    </form>
  );
}
