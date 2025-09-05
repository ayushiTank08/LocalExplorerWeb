'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface StaticMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  className?: string;
  markerColor?: string;
}

const StaticMap: React.FC<StaticMapProps> = ({
  latitude,
  longitude,
  zoom = 14,
  className = 'w-full h-full rounded-lg',
  markerColor = '#3b82f6',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapboxToken] = useState(() => process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapboxToken) {
      setError('Mapbox token is not configured');
      return;
    }

    const loadMap = async () => {
      try {
        const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/
          pin-s+${markerColor.slice(1)}(${longitude},${latitude})/
          ${longitude},${latitude},${zoom},0/
          800x400@2x
          ?access_token=${mapboxToken}&attribution=false&logo=false`.replace(/\s+/g, '');

        const img = document.createElement('img');
        img.src = mapImageUrl;
        img.alt = `Location at ${latitude}, ${longitude}`;
        img.className = 'w-full h-full object-cover rounded-lg';
        
        const onLoad = () => {
          if (mapContainer.current) {
            mapContainer.current.innerHTML = '';
            mapContainer.current.appendChild(img);
            setError(null);
          }
        };
        
        const onError = (err: ErrorEvent) => {
          console.error('Error loading map:', err);
          setError('Failed to load map. Please check your internet connection.');
        };

        img.addEventListener('load', onLoad);
        img.addEventListener('error', onError);

        return () => {
          img.removeEventListener('load', onLoad);
          img.removeEventListener('error', onError);
          if (mapContainer.current) {
            mapContainer.current.innerHTML = '';
          }
        };
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Error loading map. Please try again.');
      }
    };

    loadMap();
  }, [latitude, longitude, zoom, markerColor, mapboxToken]);

  if (error) {
    return (
      <div className={`${className} bg-gray-50 rounded-lg flex flex-col items-center justify-center p-6 border border-gray-200`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Map Unavailable</h3>
          <p className="text-sm text-gray-600 mb-2">We couldn't load the map for this location.</p>
          <p className="text-xs text-gray-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className={`${className} bg-gray-50 rounded-lg overflow-hidden border border-gray-200`}
      style={{
        height: '100%'
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700">Loading map...</p>
          <p className="text-xs text-gray-500 mt-1">Showing location at {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
};

export default StaticMap;
