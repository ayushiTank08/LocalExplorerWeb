import React from 'react';
import { Button } from "@nextforge/ui";

const DUMMY_IMAGES = Array.from({ length: 25 }, (_, i) => 
  `https://picsum.photos/1000/700?random=${i}`
);

interface ImageGalleryProps {
  images?: string[];
  currentImageIndex: number;
  onImageChange: (index: number) => void;
  onImageClick?: () => void;
}

export const Slider: React.FC<ImageGalleryProps> = React.memo(({ 
  images = DUMMY_IMAGES,
  currentImageIndex, 
  onImageChange,
  onImageClick
}) => {
  if (images.length <= 0) return null;

  return (
    <div className="relative rounded-lg overflow-hidden bg-white shadow-lg">
      <div className="h-113 bg-gray-300 relative">
        <div className="relative w-full h-full">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onImageClick?.();
            }}
            className="w-full h-full focus:outline-none"
            aria-label="View full screen gallery"
          >
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0">
                <img
                  src={images[currentImageIndex]}
                  alt=""
                  className="w-full h-full object-cover blur-md scale-105"
                  aria-hidden="true"
                />
              </div>
              <img
                src={images[currentImageIndex]}
                alt="Gallery"
                className="relative max-w-full max-h-full object-contain"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
          </button>
        </div>

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
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${i === currentImageIndex ? 'bg-[var(--color-primary)]' : 'bg-white/50'}`}
                onClick={() => onImageChange(i)}
              />
            ))}
          </div>
        )}

        {/* <Button 
          className="absolute bottom-3 right-4 bg-white/90 backdrop-blur-sm rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onImageClick?.();
          }}
        >
          Show all (+{images.length})
        </Button> */}
      </div>
    </div>
  );
});

Slider.displayName = 'Slider';
