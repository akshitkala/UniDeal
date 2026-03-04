"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
    onUpload: (urls: string[]) => void;
    maxFiles?: number;
    existingUrls?: string[];
}

export default function PhotoUploadZone({ onUpload, maxFiles = 6, existingUrls = [] }: Props) {
    const [urls, setUrls] = useState<string[]>(existingUrls);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;
        setError(null);

        const newFiles = Array.from(files);

        if (urls.length + newFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} images allowed`);
            return;
        }

        for (const file of newFiles) {
            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                setError("JPG, PNG, and WebP only");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError("Max 5MB per photo");
                return;
            }
        }

        setUploading(true);
        const formData = new FormData();
        newFiles.forEach((f) => formData.append("images", f));

        try {
            const res = await fetch("/api/listings/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            const newUrls = [...urls, ...data.urls];
            setUrls(newUrls);
            onUpload(newUrls);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
        onUpload(newUrls);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
                onClick={() => fileInputRef.current?.click()}
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
                    cursor: "pointer",
                    transition: "border-color 0.2s var(--ease)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                }}
            >
                <div style={{ fontSize: 24 }}>📸</div>
                <div style={{ fontWeight: 600, color: "var(--ink-2)", fontSize: 14 }}>
                    {uploading ? "Uploading..." : "Drag & drop photos or click to upload"}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-4)" }}>
                    JPG, PNG, WebP · Max 5MB per photo · {urls.length}/{maxFiles}
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
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    width: 20,
                                    height: 20,
                                    borderRadius: "50%",
                                    background: "rgba(0,0,0,0.5)",
                                    color: "white",
                                    border: "none",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: 12
                                }}
                            >
                                ×
                            </button>
                            {i === 0 && (
                                <div style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: "rgba(0,0,0,0.5)",
                                    color: "white",
                                    fontSize: 8,
                                    textAlign: "center",
                                    padding: "2px 0",
                                    fontWeight: 600
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
