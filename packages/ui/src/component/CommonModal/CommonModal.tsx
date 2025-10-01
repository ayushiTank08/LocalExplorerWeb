import React, { ReactNode } from 'react';

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

const CommonModal: React.FC<CommonModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-[90%] max-w-[360px]',
    md: 'w-[95%] max-w-[500px]',
    lg: 'w-[95%] max-w-[600px]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/20 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div 
        className={`relative bg-white rounded-lg shadow-xl transform transition-all ${sizeClasses[size]}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        {showCloseButton && (
          <button
            type="button"
            className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CommonModal;
