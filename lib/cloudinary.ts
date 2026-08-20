const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

function getRequiredPublicEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getCloudinaryUploadConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  return {
    cloudName: getRequiredPublicEnv(
      cloudName,
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
    ),
    uploadPreset: getRequiredPublicEnv(
      uploadPreset,
      "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
    ),
    folder: "unideal/listings",
  };
}

export function getCloudinaryUploadUrl(): string {
  const { cloudName: resolvedCloudName } = getCloudinaryUploadConfig();

  return `https://api.cloudinary.com/v1_1/${resolvedCloudName}/image/upload`;
}

