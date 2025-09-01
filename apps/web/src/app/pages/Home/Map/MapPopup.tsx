"use client";

import React from 'react';
import { Place } from '../../../../store/slices/placesSlice';
import { IconButton } from '@nextforge/ui';

interface MapPopupProps {
  place: Place;
  onClose: () => void;
}

const MapPopup: React.FC<MapPopupProps> = ({ place, onClose }) => {
  return (
    <div className="bg-[var(--color-background)] rounded-lg shadow-lg overflow-hidden w-[270px]">
      <div className="relative">
        <img
          src={place.Thumb || place.Image || '/placeholder-image.jpg'}
          alt={place.Title}
          className="w-full h-32 object-cover"
        />

        <IconButton
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 bg-[var(--color-background)] bg-opacity-90 rounded-full flex items-center justify-center shadow-md hover:bg-opacity-100 transition-all cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </IconButton>

        <IconButton className="absolute top-2 right-12 w-8 h-8 bg-[var(--color-background)] bg-opacity-90 rounded-full flex items-center justify-center shadow-md hover:bg-opacity-100 transition-all cursor-pointer">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-600"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </IconButton>
      </div>


      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {place.Title}
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          {[place.Address, place.City, place.State, place.ZipCode].filter(Boolean).join(', ')}
        </p>
      </div>
    </div>
  );
};

export default MapPopup;
