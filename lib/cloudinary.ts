/**
 * Cloudinary configuration and upload helper.
 * TRD §6: Browser uploads directly to Cloudinary using an unsigned upload preset.
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export const CLOUDINARY_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit (TRD §6)
export const CLOUDINARY_MAX_IMAGES = 4; // Max 4 images per listing

export function getCloudinaryUploadUrl(): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not configured.');
  }
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
}

export function getCloudinaryUploadPreset(): string {
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!preset) {
    throw new Error('NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is not configured.');
  }
  return preset;
}
