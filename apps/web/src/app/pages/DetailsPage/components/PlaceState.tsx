import React from 'react';

interface PlaceStateProps {
  type: 'loading' | 'error' | 'not-found';
  message?: string;
}

export const PlaceState: React.FC<PlaceStateProps> = ({ type, message }) => {
  const states = {
    loading: {
      title: 'Loading...',
      message: 'Fetching place details...',
    },
    error: {
      title: 'Error',
      message: message || 'Failed to load place details. Please try again later.',
    },
    'not-found': {
      title: 'Place not found',
      message: message || "The place you're looking for doesn't exist or has been removed.",
    },
  };

  const { title, message: stateMessage } = states[type];

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-semibold text-gray-600 mb-2">{title}</div>
        <div className="text-sm text-gray-500">{stateMessage}</div>
      </div>
    </div>
  );
};

export const LoadingState: React.FC = () => <PlaceState type="loading" />;
export const ErrorState: React.FC<{ message?: string }> = ({ message }) => (
  <PlaceState type="error" message={message} />
);
export const NotFoundState: React.FC = () => <PlaceState type="not-found" />;
