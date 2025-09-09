import React, { useEffect, useState } from 'react';

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&h=700&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1000&h=700&fit=crop',
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1000&h=700&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1000&h=700&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1000&h=700&fit=crop'
];

interface ImageGalleryPopupProps {
  images?: string[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const ImageGalleryPopup: React.FC<ImageGalleryPopupProps> = ({
  images = DUMMY_IMAGES, // Use dummy images if none provided
  isOpen,
  onClose,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsVisible(true);
      setCurrentIndex(initialIndex);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);
  
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleThumbnailClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div 
      onClick={handleClose}
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className="relative bg-white rounded-lg overflow-hidden w-full max-w-4xl h-[700px] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Photo Gallery</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close gallery"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="w-6 h-6"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="relative flex-1 bg-gray-100 flex items-center justify-center">
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src={images[currentIndex]} 
              alt={`Gallery image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          </div>
          
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10"
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={(e) => handleThumbnailClick(index, e)}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  currentIndex === index 
                    ? 'border-blue-500 scale-105' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img 
                  src={img} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
