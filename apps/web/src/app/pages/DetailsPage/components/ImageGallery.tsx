import React from 'react';
import { Button } from "@nextforge/ui";

interface ImageGalleryProps {
  images: string[];
  currentImageIndex: number;
  onImageChange: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = React.memo(({ 
  images, 
  currentImageIndex, 
  onImageChange 
}) => {
  if (images.length <= 0) return null;

  return (
    <div className="relative rounded-lg overflow-hidden bg-white shadow-lg">
      <div className="h-113 bg-gray-300 relative">
        <img
          src={images[currentImageIndex]}
          alt="Gallery"
          className="w-full h-full object-cover"
        />

        {images.length > 1 && (
          <>
            <Button
              className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
              onClick={() => onImageChange(currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1)}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
              onClick={() => onImageChange(currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0)}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${i === currentImageIndex ? 'bg-[var(--color-primary)]' : 'bg-white/50'}`}
                onClick={() => onImageChange(i)}
              />
            ))}
          </div>
        )}

        <Button className="absolute bottom-3 right-4 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-sm font-medium text-gray-700 hover:bg-white transition-colors">
          Show all (+{Math.max(0, images.length - 3)})
        </Button>
      </div>
    </div>
  );
});

ImageGallery.displayName = 'ImageGallery';
