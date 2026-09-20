'use client';

import React, { useState } from 'react';

interface ListingDetailClientProps {
  images: string[];
  title: string;
}

export default function ListingDetailClient({ images, title }: ListingDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const activeImage = images[selectedImageIndex] || images[0];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-square w-full rounded-lg border border-border bg-surface overflow-hidden">
        {activeImage ? (
          <img
            src={activeImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-muted text-sm">
            No image available
          </div>
        )}
      </div>

      {/* Thumbnail Selector (if more than 1 image) */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImageIndex(idx)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary ${
                selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
