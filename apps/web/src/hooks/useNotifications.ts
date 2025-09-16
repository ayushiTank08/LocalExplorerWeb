import { useCallback } from 'react';
import { showNotification } from '@/components/Notifications/NotificationCenter';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationOptions {
  type?: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

export const useNotifications = () => {
  const notify = useCallback(({ type = 'info', title, message, duration }: NotificationOptions) => {
    return showNotification({
      type,
      title,
      message,
      duration,
    });
  }, []);

  const notifySuccess = useCallback((title: string, message: string, duration?: number) => {
    return notify({ type: 'success', title, message, duration });
  }, [notify]);

  const notifyError = useCallback((title: string, message: string, duration?: number) => {
    return notify({ type: 'error', title, message, duration });
  }, [notify]);

  const notifyInfo = useCallback((title: string, message: string, duration?: number) => {
    return notify({ type: 'info', title, message, duration });
  }, [notify]);

  const notifyWarning = useCallback((title: string, message: string, duration?: number) => {
    return notify({ type: 'warning', title, message, duration });
  }, [notify]);

  return {
    notify,
    notifySuccess,
    notifyError,
    notifyInfo,
    notifyWarning,
  };
};
