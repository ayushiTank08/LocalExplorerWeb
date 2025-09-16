import React, { useEffect, useState } from "react";
import { decryptData } from "@/utils/encryption";
import { Button } from "@headlessui/react";

interface Activity {
  Id: number;
  FirstName: string;
  LastName: string;
  Profile: string;
  Comment: string;
  CreatedDate: number;
  PhotoURL: string;
  LikeCount: number;
  CommentCount: number;
  LoyaltyEventId: number;
}

interface ImageGalleryPopupProps {
  activities?: Activity[];
  isOpen: boolean;
  onClose: () => void;
  locationName?: string;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const ImageGalleryPopup: React.FC<ImageGalleryPopupProps> = ({
  activities: propActivities = [],
  isOpen,
  onClose,
  locationName = 'Location',
}) => {
  const activities = Array.isArray(propActivities) ? propActivities : [];
  const [isVisible, setIsVisible] = useState(false);
  const [imageStatus, setImageStatus] = useState<Record<number, 'loading' | 'loaded' | 'error'>>({});

  useEffect(() => {
    const status: Record<number, 'loading' | 'loaded' | 'error'> = {};
    activities.forEach(activity => {
      status[activity.Id] = 'loading';
    });
    setImageStatus(status);
  }, [activities]);

  const handleImageLoad = (id: number) => {
    setImageStatus(prev => ({
      ...prev,
      [id]: 'loaded'
    }));
  };

  const handleImageError = (id: number) => {
    setImageStatus(prev => ({
      ...prev,
      [id]: 'error'
    }));
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="relative bg-white rounded-lg overflow-hidden w-full max-w-6xl h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center py-4 border-b border-[#D6D7D6] mx-4">
          <div>
            <h2 className="text-xl font-semibold">Gallery</h2>
            <p className="text-gray-500">{locationName}</p>
          </div>
          <Button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            aria-label="Close gallery"
          >
            &times;
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activities.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No gallery images available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activities.map((activity) => {
                const isLoading = imageStatus[activity.Id] === 'loading';
                const hasError = imageStatus[activity.Id] === 'error';
                const isLoaded = imageStatus[activity.Id] === 'loaded';
                
                const decryptedActivity = {
                  ...activity,
                  FirstName: activity.FirstName ? decryptData(activity.FirstName) : 'User',
                  LastName: activity.LastName ? decryptData(activity.LastName) : '',
                };
                
                return (
                  <div
                    key={activity.Id}
                    className="relative rounded-md overflow-hidden shadow-sm bg-white"
                  >
                    <div className="aspect-square overflow-hidden relative bg-gray-100">
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-pulse w-full h-full bg-gray-200"></div>
                        </div>
                      )}
                      {hasError ? (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                          <span className="text-red-500 text-sm">Failed to load</span>
                        </div>
                      ) : activity.PhotoURL ? (
                        <img
                          src={activity.PhotoURL}
                          alt={`Gallery image ${activity.Id}`}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            isLoaded ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad(activity.Id)}
                          onError={() => handleImageError(activity.Id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                                            {process.env.NODE_ENV === 'development' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-[13px] p-2 truncate">
                          <span className="text-[#000000]/70">Posted by:</span>{' '}
                          <span className="text-[var(--color-secondary)] font-bold">
                            {decryptedActivity.FirstName || 'User'} {decryptedActivity.LastName || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};