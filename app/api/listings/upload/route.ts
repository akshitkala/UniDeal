import { NextResponse } from "next/server";
import { requireAuth } from "@/middleware/auth";
import cloudinary from "@/lib/auth/../../lib/cloudinary"; // Adjusted path if needed, but @/lib/cloudinary is safer
// Wait, I put it in lib/cloudinary.ts, so @/lib/cloudinary.

import { v2 as cloudinaryV2 } from "cloudinary";

export async function POST(request: Request) {
    try {
        const userOrResponse = await requireAuth();
        if (userOrResponse instanceof NextResponse) return userOrResponse;

        const formData = await request.formData();
        const files = formData.getAll("images") as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: "No images provided" }, { status: 400 });
        }

        if (files.length > 6) {
            return NextResponse.json({ error: "Maximum 6 images allowed" }, { status: 400 });
        }

        let totalSize = 0;
        for (const file of files) {
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                return NextResponse.json({ error: `Invalid file type: ${file.name}` }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 });
            }
            totalSize += file.size;
        }

        if (totalSize > 15 * 1024 * 1024) {
            return NextResponse.json({ error: "Total upload size exceeds 15MB" }, { status: 400 });
        }

        const uploadPromises = files.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return new Promise<string>((resolve, reject) => {
                const uploadStream = cloudinaryV2.uploader.upload_stream(
                    { folder: "listings", quality: "auto", fetch_format: "auto" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result!.secure_url);
                    }
                );
                uploadStream.end(buffer);
            });
        });

        const urls = await Promise.all(uploadPromises);
        return NextResponse.json({ urls });
    } catch (error: any) {
        if (error instanceof Response) return error;
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
