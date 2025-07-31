import notifications from '../data/mockNotifications.json';
import { NotificationVM } from '../vms/notification.vm';
import { toNotificationVM } from '../mappers/notification.mapper';

let notificationData = [...notifications];

export class NotificationService {
  static getAll(): NotificationVM[] {
    return notificationData.map(toNotificationVM);
  }

  static getById(id: string): NotificationVM | undefined {
    const notification = notificationData.find(n => n.id === id);
    return notification ? toNotificationVM(notification) : undefined;
  }

  static create(data: Omit<NotificationVM, 'id' | 'createdAt'>): NotificationVM {
    const newNotification = {
      id: (notificationData.length + 1).toString(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    notificationData.push(newNotification);
    return toNotificationVM(newNotification);
  }

  static update(id: string, data: Partial<Omit<NotificationVM, 'id' | 'createdAt'>>): NotificationVM | undefined {
    const idx = notificationData.findIndex(n => n.id === id);
    if (idx === -1) return undefined;
    notificationData[idx] = { ...notificationData[idx], ...data };
    return toNotificationVM(notificationData[idx]);
  }

  static delete(id: string): boolean {
    const idx = notificationData.findIndex(n => n.id === id);
    if (idx === -1) return false;
    notificationData.splice(idx, 1);
    return true;
  }
} 