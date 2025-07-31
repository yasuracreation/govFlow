import { NotificationVM } from '../vms/notification.vm';

export function toNotificationVM(notification: any): NotificationVM {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt,
  };
} 