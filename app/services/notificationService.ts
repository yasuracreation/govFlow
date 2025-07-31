import { User, UserRole } from '../types';
import { API_BASE_URL } from '../apiConfig';

export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'in_app' | 'system';
  title: string;
  message: string;
  recipientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  status: 'pending' | 'sent' | 'failed' | 'read';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'workflow' | 'task' | 'approval' | 'reminder' | 'system' | 'alert';
  metadata?: {
    serviceRequestId?: string;
    workflowId?: string;
    stepId?: string;
    actionUrl?: string;
    expiresAt?: string;
  };
  createdAt: string;
  sentAt?: string;
  readAt?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'in_app';
  category: Notification['category'];
  subject?: string;
  title: string;
  message: string;
  variables: string[]; // e.g., ['{{citizenName}}', '{{serviceType}}', '{{status}}']
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const NOTIFICATIONS_URL = `${API_BASE_URL}/notifications`;

export async function getNotifications() {
  const res = await fetch(NOTIFICATIONS_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function getNotificationById(id: string) {
  const res = await fetch(`${NOTIFICATIONS_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to fetch notification');
  return res.json();
}

export async function createNotification(notification: any) {
  const res = await fetch(NOTIFICATIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(notification)
  });
  if (!res.ok) throw new Error('Failed to create notification');
  return res.json();
}

export async function updateNotification(id: string, notification: any) {
  const res = await fetch(`${NOTIFICATIONS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(notification)
  });
  if (!res.ok) throw new Error('Failed to update notification');
  return res.json();
}

export async function deleteNotification(id: string) {
  const res = await fetch(`${NOTIFICATIONS_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  if (!res.ok) throw new Error('Failed to delete notification');
}

class NotificationService {
  private notifications: Notification[] = [];
  private templates: NotificationTemplate[] = [];

  // Get notifications for a user
  async getNotifications(userId: string, filters?: {
    status?: Notification['status'];
    category?: Notification['category'];
    type?: Notification['type'];
    unreadOnly?: boolean;
  }): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let filteredNotifications = this.notifications.filter(n => n.recipientId === userId);

    if (filters) {
      if (filters.status) {
        filteredNotifications = filteredNotifications.filter(n => n.status === filters.status);
      }
      if (filters.category) {
        filteredNotifications = filteredNotifications.filter(n => n.category === filters.category);
      }
      if (filters.type) {
        filteredNotifications = filteredNotifications.filter(n => n.type === filters.type);
      }
      if (filters.unreadOnly) {
        filteredNotifications = filteredNotifications.filter(n => n.status !== 'read');
      }
    }

    return filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    const notifications = await this.getNotifications(userId, { unreadOnly: true });
    return notifications.length;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification | null> {
    await new Promise(resolve => setTimeout(resolve, 100));

    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return null;

    notification.status = 'read';
    notification.readAt = new Date().toISOString();

    return notification;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    this.notifications
      .filter(n => n.recipientId === userId && n.status !== 'read')
      .forEach(n => {
        n.status = 'read';
        n.readAt = new Date().toISOString();
      });
  }

  // Send notification
  async sendNotification(notificationData: Omit<Notification, 'id' | 'createdAt' | 'status'>): Promise<Notification> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const notification: Notification = {
      ...notificationData,
      id: `NOT${String(this.notifications.length + 1).padStart(3, '0')}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);

    // Simulate sending based on type
    setTimeout(() => {
      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();
    }, 1000);

    return notification;
  }

  // Send notification using template
  async sendTemplateNotification(
    templateId: string,
    recipientId: string,
    variables: Record<string, string>,
    metadata?: Notification['metadata']
  ): Promise<Notification | null> {
    const template = this.templates.find(t => t.id === templateId && t.isActive);
    if (!template) return null;

    let message = template.message;
    let title = template.title;
    let subject = template.subject;

    // Replace variables
    template.variables.forEach(variable => {
      const key = variable.replace(/[{}]/g, '');
      const value = variables[key] || '';
      message = message.replace(new RegExp(variable, 'g'), value);
      title = title.replace(new RegExp(variable, 'g'), value);
      if (subject) {
        subject = subject.replace(new RegExp(variable, 'g'), value);
      }
    });

    return this.sendNotification({
      type: template.type,
      title,
      message,
      recipientId,
      priority: 'medium',
      category: template.category,
      metadata
    });
  }

  // Send workflow notifications
  async sendWorkflowNotification(
    event: 'submitted' | 'assigned' | 'approved' | 'rejected' | 'completed' | 'correction_requested',
    serviceRequestId: string,
    recipientId: string,
    additionalData?: Record<string, string>
  ): Promise<void> {
    const templates = {
      submitted: 'TPL001',
      assigned: 'TPL002',
      approved: 'TPL003',
      rejected: 'TPL003',
      completed: 'TPL004',
      correction_requested: 'TPL005'
    };

    const templateId = templates[event];
    if (templateId) {
      await this.sendTemplateNotification(
        templateId,
        recipientId,
        {
          serviceRequestId,
          ...additionalData
        },
        { serviceRequestId }
      );
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(
    notifications: Omit<Notification, 'id' | 'createdAt' | 'status'>[]
  ): Promise<Notification[]> {
    const results: Notification[] = [];
    
    for (const notificationData of notifications) {
      const notification = await this.sendNotification(notificationData);
      results.push(notification);
    }

    return results;
  }

  // Get notification templates
  async getTemplates(filters?: {
    type?: NotificationTemplate['type'];
    category?: NotificationTemplate['category'];
    isActive?: boolean;
  }): Promise<NotificationTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let filteredTemplates = [...this.templates];

    if (filters) {
      if (filters.type) {
        filteredTemplates = filteredTemplates.filter(t => t.type === filters.type);
      }
      if (filters.category) {
        filteredTemplates = filteredTemplates.filter(t => t.category === filters.category);
      }
      if (filters.isActive !== undefined) {
        filteredTemplates = filteredTemplates.filter(t => t.isActive === filters.isActive);
      }
    }

    return filteredTemplates;
  }

  // Create or update notification template
  async saveTemplate(templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const existingIndex = this.templates.findIndex(t => t.name === templateData.name);
    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      // Update existing template
      this.templates[existingIndex] = {
        ...this.templates[existingIndex],
        ...templateData,
        updatedAt: now
      };
      return this.templates[existingIndex];
    } else {
      // Create new template
      const newTemplate: NotificationTemplate = {
        ...templateData,
        id: `TPL${String(this.templates.length + 1).padStart(3, '0')}`,
        createdAt: now,
        updatedAt: now
      };
      this.templates.push(newTemplate);
      return newTemplate;
    }
  }

  // Delete notification template
  async deleteTemplate(templateId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const index = this.templates.findIndex(t => t.id === templateId);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    return true;
  }

  // Get notification statistics
  async getStatistics(userId?: string): Promise<{
    total: number;
    sent: number;
    pending: number;
    failed: number;
    read: number;
    byType: Record<Notification['type'], number>;
    byCategory: Record<Notification['category'], number>;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));

    let notifications = this.notifications;
    if (userId) {
      notifications = notifications.filter(n => n.recipientId === userId);
    }

    const stats = {
      total: notifications.length,
      sent: notifications.filter(n => n.status === 'sent').length,
      pending: notifications.filter(n => n.status === 'pending').length,
      failed: notifications.filter(n => n.status === 'failed').length,
      read: notifications.filter(n => n.status === 'read').length,
      byType: {} as Record<Notification['type'], number>,
      byCategory: {} as Record<Notification['category'], number>
    };

    // Count by type
    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    });

    // Count by category
    notifications.forEach(n => {
      stats.byCategory[n.category] = (stats.byCategory[n.category] || 0) + 1;
    });

    return stats;
  }
}

export default new NotificationService(); 