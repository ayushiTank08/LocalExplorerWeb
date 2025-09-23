"use client";

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { toast, Toast as ToastType, Toaster as HotToaster } from 'react-hot-toast';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  t: ToastType;
}

const Notification = ({ type, title, message, t }: NotificationProps) => {
  const icons = {
    success: <CheckCircleIcon className="h-6 w-6 text-green-500" aria-hidden="true" />,
    error: <ExclamationTriangleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />,
    warning: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />,
    info: <InformationCircleIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />,
  };

  const bgColors = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    warning: 'bg-yellow-50',
    info: 'bg-blue-50',
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
      <Transition
        show={t.visible}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={`w-full max-w-sm overflow-hidden rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${bgColors[type]}`}>
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {icons[type]}
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
              <div className="ml-4 flex flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => toast.dismiss(t.id)}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export const showNotification = ({
  type = 'info',
  title,
  message,
  duration = 5000,
}: {
  type?: NotificationType;
  title: string;
  message: string;
  duration?: number;
}) => {
  return toast.custom(
    (t) => (
      <Notification
        type={type}
        title={title}
        message={message}
        t={t}
      />
    ),
    { duration }
  );
};

export const NotificationCenter = () => {
  return (
    <div className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 z-50">
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        <HotToaster
          position="top-right"
          toastOptions={{
            className: '',
            style: {
              border: '1px solid #E5E7EB',
              padding: '16px',
              color: '#1F2937',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
            },
            success: {
              duration: 5000,
              iconTheme: {
                primary: '#10B981',
                secondary: 'white',
              },
            },
            error: {
              duration: 10000,
              iconTheme: {
                primary: '#EF4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </div>
  );
};
