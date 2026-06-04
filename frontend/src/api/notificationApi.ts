import api from './api';

export interface Notification {
  id: number;
  userId: number;
  message: string;
  ticketId?: number;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<{ success: boolean; data: Notification[] }>('/api/notifications');
    return response.data.data;
  },

  // Single notification mark as read
  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/api/notifications/${id}/read`);
  },

  // Sab mark as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/api/notifications/read');
  },
};