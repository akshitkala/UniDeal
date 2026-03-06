"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
    onUpload: (urls: string[]) => void;
    maxFiles?: number;
    existingUrls?: string[];
}

// Resize image client-side before upload — max 1200px longest side, 85% JPEG quality
async function resizeImage(file: File, maxPx = 1200, quality = 0.85): Promise<File> {
    return new Promise((resolve) => {
        const img = new globalThis.Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const { width, height } = img;

            let newW = width;
            let newH = height;
            if (width > maxPx || height > maxPx) {
                if (width >= height) {
                    newW = maxPx;
                    newH = Math.round((height / width) * maxPx);
                } else {
                    newH = maxPx;
                    newW = Math.round((width / height) * maxPx);
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = newW;
            canvas.height = newH;
            const ctx = canvas.getContext("2d")!;
            ctx.drawImage(img, 0, 0, newW, newH);

            canvas.toBlob(
                (blob) => {
                    if (!blob) { resolve(file); return; }
                    const resized = new File(
                        [blob],
                        file.name.replace(/\.\w+$/, ".jpg"),
                        { type: "image/jpeg", lastModified: Date.now() }
                    );
                    resolve(resized);
                },
                "image/jpeg",
                quality
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
        img.src = url;
    });
}

export default function PhotoUploadZone({ onUpload, maxFiles = 6, existingUrls = [] }: Props) {
    const [urls, setUrls] = useState<string[]>(existingUrls);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;
        setError(null);

        const newFiles = Array.from(files);

        // Count check
        if (urls.length + newFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} photos allowed`);
            return;
        }

        // Type check before resize
        const invalid = newFiles.find(
            (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type)
        );
        if (invalid) {
            setError("JPG, PNG, and WebP only");
            return;
        }

        setUploading(true);
        setProgress(0);

        const uploadedUrls: string[] = [];

        for (let i = 0; i < newFiles.length; i++) {
            try {
                // Resize before upload — result always well under 1MB
                const resized = await resizeImage(newFiles[i]);

                const formData = new FormData();
                formData.append("images", resized);

                const res = await fetch("/api/listings/upload", {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Upload failed");

                uploadedUrls.push(...(data.urls ?? []));
                setProgress(Math.round(((i + 1) / newFiles.length) * 100));
            } catch (err: any) {
                setError(err.message);
                setUploading(false);
                return;
            }
        }

        const newUrls = [...urls, ...uploadedUrls];
        setUrls(newUrls);
        onUpload(newUrls);
        setUploading(false);
        setProgress(0);
    };

    const removePhoto = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
        onUpload(newUrls);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "var(--ink)";
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "var(--border)";
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "var(--border)";
                    handleFiles(e.dataTransfer.files);
                }}
                style={{
                    border: "2px dashed var(--border)",
                    borderRadius: "var(--r-md)",
                    padding: "32px 20px",
                    textAlign: "center",
                    cursor: uploading ? "not-allowed" : "pointer",
                    transition: "border-color 0.2s var(--ease)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    opacity: uploading ? 0.7 : 1,
                }}
            >
                <div style={{ fontSize: 24 }}>{uploading ? "⏳" : "📸"}</div>
                <div style={{ fontWeight: 600, color: "var(--ink-2)", fontSize: 14 }}>
                    {uploading
                        ? `Resizing & uploading… ${progress}%`
                        : "Drag & drop photos or click to upload"}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-4)" }}>
                    JPG, PNG, WebP · Auto-resized to 1200px · {urls.length}/{maxFiles}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: "none" }}
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {/* Progress bar */}
            {uploading && (
                <div style={{ height: 4, background: "var(--bg-2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{
                        height: "100%", background: "var(--amber)",
                        width: `${progress}%`, transition: "width 0.3s ease",
                        borderRadius: 2,
                    }} />
                </div>
            )}

            {error && (
                <div style={{ color: "var(--red)", fontSize: 12, fontWeight: 500 }}>
                    ⚠️ {error}
                </div>
            )}

            {urls.length > 0 && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                    gap: 10
                }}>
                    {urls.map((url, i) => (
                        <div key={url} style={{
                            position: "relative",
                            aspectRatio: "1/1",
                            borderRadius: "var(--r)",
                            overflow: "hidden",
                            border: "1px solid var(--border-2)"
                        }}>
                            <Image src={url} alt={`Listing photo ${i + 1}`} fill style={{ objectFit: "cover" }} />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removePhoto(i);
                                }}
                                style={{
                                    position: "absolute", top: 4, right: 4,
                                    width: 20, height: 20, borderRadius: "50%",
                                    background: "rgba(0,0,0,0.5)", color: "white",
                                    border: "none", display: "flex",
                                    alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", fontSize: 12
                                }}
                            >
                                ×
                            </button>
                            {i === 0 && (
                                <div style={{
                                    position: "absolute", bottom: 0, left: 0, right: 0,
                                    background: "rgba(0,0,0,0.5)", color: "white",
                                    fontSize: 8, textAlign: "center", padding: "2px 0", fontWeight: 600
                                }}>
                                    COVER
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
