import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  height?: string | number;
  width?: string | number;
  fullWidth?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  count = 1,
  rounded = 'md',
  height,
  width,
  fullWidth = false,
}) => {
  const roundedClass = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  const skeletonStyle = {
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(fullWidth && { width: '100%' }),
  };

  const skeletons = Array(count).fill(
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${roundedClass} ${className}`}
      style={skeletonStyle}
    />
  );

  return (
    <>
      {count === 1 ? (
        skeletons[0]
      ) : (
        <div className="space-y-2">
          {skeletons.map((skeleton, index) => (
            <React.Fragment key={index}>{skeleton}</React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

export const CardSkeleton = () => (
  <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
    <Skeleton height={160} className="w-full" />
    <div className="space-y-2">
      <Skeleton height={24} width="70%" />
      <Skeleton height={16} width="90%" />
      <Skeleton height={16} width="80%" />
    </div>
  </div>
);

export const TextSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array(lines)
      .fill(0)
      .map((_, i) => (
        <Skeleton key={i} height={16} fullWidth />
      ))}
  </div>
);

export const ImageSkeleton = ({ className = '', rounded = 'md' as const }) => (
  <Skeleton className={className} rounded={rounded} fullWidth />
);

export const MapSkeleton = ({ className = '' }) => (
  <Skeleton className={className} height={400} fullWidth />
);

export const SidebarSkeleton = () => (
  <div className="space-y-4 p-4">
    <Skeleton height={40} fullWidth />
    <Skeleton height={100} fullWidth />
    <Skeleton height={100} fullWidth />
  </div>
);
