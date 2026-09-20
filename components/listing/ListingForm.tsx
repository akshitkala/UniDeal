'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createListingSchema, listingConditions } from '@/lib/validation/listing';
import {
  getCloudinaryUploadUrl,
  getCloudinaryUploadPreset,
  CLOUDINARY_MAX_FILE_SIZE_BYTES,
  CLOUDINARY_MAX_IMAGES,
} from '@/lib/cloudinary';
import { Upload, X, AlertCircle, Check, Loader2, ArrowRight } from 'lucide-react';
import type { ListingCondition } from '@/types/domain';

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

interface InitialListingData {
  id?: string;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  category_id: number;
  condition: ListingCondition;
  images: string[];
}

interface ListingFormProps {
  initialData?: InitialListingData;
  categories: CategoryOption[];
  isEditing?: boolean;
}

export default function ListingForm({
  initialData,
  categories,
  isEditing = false,
}: ListingFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [categoryId, setCategoryId] = useState<number>(
    initialData?.category_id || (categories[0]?.id ?? 1)
  );
  const [condition, setCondition] = useState<ListingCondition>(
    initialData?.condition || 'Good'
  );
  const [price, setPrice] = useState<string>(
    initialData?.price !== undefined ? initialData.price.toString() : ''
  );
  const [negotiable, setNegotiable] = useState(initialData?.negotiable ?? false);
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Sync categoryId if categories load late
  useEffect(() => {
    if (!initialData && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, initialData, categoryId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    const availableSlots = CLOUDINARY_MAX_IMAGES - images.length;
    if (availableSlots <= 0) {
      setUploadError(`Maximum of ${CLOUDINARY_MAX_IMAGES} images allowed.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);

    // Client-side file size check (TRD §6: reject > 5MB before any network call)
    for (const file of filesToUpload) {
      if (file.size > CLOUDINARY_MAX_FILE_SIZE_BYTES) {
        setUploadError(`"${file.name}" exceeds the 5MB size limit. Please choose a smaller image.`);
        return;
      }
    }

    setUploadingImage(true);

    try {
      const uploadUrl = getCloudinaryUploadUrl();
      const uploadPreset = getCloudinaryUploadPreset();

      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Image upload failed. Please verify Cloudinary configuration.');
        }

        const data = await response.json();
        return data.secure_url as string;
      });

      const newUploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...newUploadedUrls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload images.');
    } finally {
      setUploadingImage(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const validate = () => {
    const parsedPrice = parseFloat(price);
    const result = createListingSchema.safeParse({
      title,
      description,
      price: isNaN(parsedPrice) ? -1 : parsedPrice,
      negotiable,
      category_id: Number(categoryId),
      condition,
      images,
    });

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0]?.toString();
        if (path) {
          errors[path] = err.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setSubmitting(true);

    try {
      const parsedPrice = parseFloat(price);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        price: parsedPrice,
        negotiable,
        category_id: Number(categoryId),
        condition,
        images,
      };

      const url = isEditing && initialData?.id
        ? `/api/listings/${initialData.id}`
        : '/api/listings';

      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        setGeneralError(resData.error?.message || 'Failed to save listing.');
        return;
      }

      // Redirect on success
      if (resData.data?.slug) {
        router.push(`/listing/${resData.data.slug}`);
      } else {
        router.push('/dashboard');
      }
      router.refresh();
    } catch {
      setGeneralError('An unexpected network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-border" noValidate>
      {generalError && (
        <div className="p-4 rounded-md bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* 1. Title */}
      <div>
        <label htmlFor="listing-title" className="block text-sm font-semibold text-neutral-text mb-1">
          Item Title <span className="text-danger">*</span>
        </label>
        <input
          id="listing-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: '' }));
          }}
          placeholder="e.g. Casio Scientific Calculator fx-991EX"
          maxLength={100}
          className={`w-full px-3.5 py-2.5 rounded-md border text-sm text-neutral-text placeholder:text-neutral-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] ${
            fieldErrors.title ? 'border-danger ring-1 ring-danger' : 'border-border'
          }`}
        />
        {fieldErrors.title ? (
          <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.title}</p>
        ) : (
          <p className="mt-1 text-xs text-neutral-muted">Be specific (brand, model, version). 3–100 characters.</p>
        )}
      </div>

      {/* 2. Category & 3. Condition (2-col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="listing-category" className="block text-sm font-semibold text-neutral-text mb-1">
            Category <span className="text-danger">*</span>
          </label>
          <select
            id="listing-category"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm text-neutral-text bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="listing-condition" className="block text-sm font-semibold text-neutral-text mb-1">
            Condition <span className="text-danger">*</span>
          </label>
          <select
            id="listing-condition"
            value={condition}
            onChange={(e) => setCondition(e.target.value as ListingCondition)}
            className="w-full px-3.5 py-2.5 rounded-md border border-border text-sm text-neutral-text bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          >
            {listingConditions.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Price & 5. Negotiable */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div>
          <label htmlFor="listing-price" className="block text-sm font-semibold text-neutral-text mb-1">
            Price (₹) <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-muted font-medium">
              ₹
            </span>
            <input
              id="listing-price"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: '' }));
              }}
              placeholder="0"
              className={`w-full pl-8 pr-3.5 py-2.5 rounded-md border text-sm text-neutral-text placeholder:text-neutral-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] ${
                fieldErrors.price ? 'border-danger ring-1 ring-danger' : 'border-border'
              }`}
            />
          </div>
          {fieldErrors.price && (
            <p className="mt-1 text-xs text-danger font-medium">{fieldErrors.price}</p>
          )}
        </div>

        <div className="pt-2 sm:pt-7">
          <label className="relative flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={negotiable}
              onChange={(e) => setNegotiable(e.target.checked)}
              className="w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-2"
            />
            <span className="text-sm font-medium text-neutral-text">
              Price is negotiable
            </span>
          </label>
          <p className="mt-1 text-xs text-neutral-muted pl-8">
            Buyers on WhatsApp may offer a counter-price.
          </p>
        </div>
      </div>

      {/* 6. Description */}
      <div>
        <label htmlFor="listing-description" className="block text-sm font-semibold text-neutral-text mb-1">
          Description <span className="text-danger">*</span>
        </label>
        <textarea
          id="listing-description"
          rows={4}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) setFieldErrors((prev) => ({ ...prev, description: '' }));
          }}
          placeholder="Mention condition details, usage duration, accessories included, reason for selling, or preferred pickup spot on campus..."
          maxLength={1000}
          className={`w-full px-3.5 py-2.5 rounded-md border text-sm text-neutral-text placeholder:text-neutral-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
            fieldErrors.description ? 'border-danger ring-1 ring-danger' : 'border-border'
          }`}
        />
        <div className="flex justify-between items-center mt-1 text-xs text-neutral-muted">
          <span>{fieldErrors.description ? <span className="text-danger font-medium">{fieldErrors.description}</span> : '10–1000 characters'}</span>
          <span>{description.length}/1000</span>
        </div>
      </div>

      {/* 7. Image Upload (1–4 images) */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-neutral-text">
            Photos (1 to 4) <span className="text-danger">*</span>
          </label>
          <span className="text-xs text-neutral-muted">{images.length}/4 photos</span>
        </div>

        {uploadError && (
          <div className="p-3 mb-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {fieldErrors.images && (
          <p className="mb-2 text-xs text-danger font-medium">{fieldErrors.images}</p>
        )}

        {/* Upload Button and Previews Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-md border border-border overflow-hidden group bg-surface">
              <img src={url} alt={`Upload preview ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`Remove photo ${idx + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {images.length < CLOUDINARY_MAX_IMAGES && (
            <label className="aspect-square rounded-md border-2 border-dashed border-border hover:border-primary/50 bg-surface/50 hover:bg-surface flex flex-col items-center justify-center p-4 cursor-pointer transition-colors text-center focus-within:ring-2 focus-within:ring-primary">
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingImage}
                onChange={handleImageUpload}
                className="sr-only"
              />
              {uploadingImage ? (
                <div className="flex flex-col items-center gap-1.5 text-neutral-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="text-xs font-medium">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-neutral-muted">
                  <Upload className="w-6 h-6 text-neutral-muted mb-0.5" />
                  <span className="text-xs font-semibold text-neutral-text">Add Photos</span>
                  <span className="text-[10px]">Max 5MB each</span>
                </div>
              )}
            </label>
          )}
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4 border-t border-border flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="py-2.5 px-4 bg-white text-neutral-text border border-border rounded-md font-medium text-sm hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary transition-colors min-h-[44px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="py-2.5 px-6 bg-primary text-white rounded-md font-semibold text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors min-h-[44px] flex items-center gap-2 shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isEditing ? (
            <span>Save Changes</span>
          ) : (
            <>
              <span>Post Listing</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
