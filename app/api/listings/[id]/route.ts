import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validation/listing";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

// Configure Cloudinary server-side (best effort)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to extract Cloudinary public ID from URL
function extractPublicId(url: string): string | null {
  try {
    // Expected URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456789/folder/subfolder/public_id.ext
    if (!url.includes("/image/upload/")) return null;
    
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    
    // parts[1] is: v123456789/folder/subfolder/public_id.ext
    let path = parts[1];
    
    // Remove version prefix if exists (e.g. v123456789/)
    const versionMatch = path.match(/^v\d+\/(.+)$/);
    if (versionMatch && versionMatch[1]) {
      path = versionMatch[1];
    }
    
    // Remove file extension (e.g. .jpg, .png)
    const dotIndex = path.lastIndexOf(".");
    if (dotIndex !== -1) {
      path = path.substring(0, dotIndex);
    }
    
    return path;
  } catch (error) {
    console.error("Failed to extract Cloudinary public ID from URL:", url, error);
    return null;
  }
}

// Helper to clean up images on Cloudinary (non-blocking)
async function cleanupCloudinaryImages(images: string[]) {
  if (!images || images.length === 0) return;
  
  console.log(`Starting Cloudinary cleanup for ${images.length} images...`);
  for (const url of images) {
    const publicId = extractPublicId(url);
    if (!publicId) continue;
    
    try {
      console.log(`Attempting to delete Cloudinary image: ${publicId}`);
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Cloudinary delete result for ${publicId}:`, result);
    } catch (error) {
      // Log the error but do not block execution
      console.error(`Failed to delete Cloudinary image ${publicId}:`, error);
    }
  }
}

// 1. PATCH - Update Listing
export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Session check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "You must be signed in to edit a listing." } },
        { status: 401 }
      );
    }

    // Fetch the listing to verify existence and ownership
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("seller_id")
      .eq("id", id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: { message: "Listing not found." } },
        { status: 404 }
      );
    }

    // Ownership check (only seller or admin can update; here we enforce owner edit)
    if (listing.seller_id !== user.id) {
      return NextResponse.json(
        { error: { message: "You are not authorized to edit this listing." } },
        { status: 403 }
      );
    }

    // Validate body using Zod schema
    const body = await request.json();
    const result = listingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            message: "Validation failed.",
            details: result.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Update row in DB (excluding status, keeping status untouched)
    const { data: updatedListing, error: updateError } = await supabase
      .from("listings")
      .update({
        title: result.data.title,
        description: result.data.description,
        price: result.data.price,
        negotiable: result.data.negotiable,
        category_id: result.data.category_id,
        condition: result.data.condition,
        images: result.data.images,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedListing) {
      console.error("Error updating listing:", updateError);
      return NextResponse.json(
        { error: { message: "Failed to update listing. Please try again." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: updatedListing }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in PATCH endpoint:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}

// 2. DELETE - Delete Listing
export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

    // Session check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: { message: "You must be signed in to delete a listing." } },
        { status: 401 }
      );
    }

    // Fetch the listing to verify existence, ownership, and get images for cleanup
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("seller_id, images")
      .eq("id", id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: { message: "Listing not found." } },
        { status: 404 }
      );
    }

    // Ownership check
    if (listing.seller_id !== user.id) {
      return NextResponse.json(
        { error: { message: "You are not authorized to delete this listing." } },
        { status: 403 }
      );
    }

    // Trigger Cloudinary cleanup (best-effort, non-blocking: we do not await it before deleting from DB)
    // This satisfies the requirement that a failed Cloudinary cleanup never blocks DB deletion
    cleanupCloudinaryImages(listing.images).catch((err) => {
      console.error("Cloudinary cleanup failed background task:", err);
    });

    // Delete listing row in DB
    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting listing from database:", deleteError);
      return NextResponse.json(
        { error: { message: "Failed to delete listing from database." } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in DELETE endpoint:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred." } },
      { status: 500 }
    );
  }
}
