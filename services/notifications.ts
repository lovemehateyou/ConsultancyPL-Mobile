import { apiRequest } from './api';

export type NotificationItem = {
  id: string;
  bookingId?: string | null;
  recipientId?: string;
  type: 'booking_request' | 'booking_update' | 'system';
  message: string;
  metadata?: Record<string, unknown> | null;
  read: boolean;
  createdAt?: string;
};

type NotificationsResponse = {
  data: NotificationItem[];
};

type MarkReadResponse = {
  data: NotificationItem;
};

type MarkAllResponse = {
  data: { updatedCount: number };
};

type NotificationListParams = {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
};

const buildQueryString = (params: NotificationListParams) => {
  const query = new URLSearchParams();
  if (typeof params.unreadOnly === 'boolean') {
    query.append('unreadOnly', params.unreadOnly ? 'true' : 'false');
  }
  if (typeof params.limit === 'number') {
    query.append('limit', String(params.limit));
  }
  if (typeof params.offset === 'number') {
    query.append('offset', String(params.offset));
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchNotifications = async (params: NotificationListParams = {}) => {
  const response = await apiRequest<NotificationsResponse>(`/notifications${buildQueryString(params)}`);
  return response.data;
};

export const markNotificationRead = async (notificationId: string) => {
  const response = await apiRequest<MarkReadResponse>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await apiRequest<MarkAllResponse>('/notifications/read-all', {
    method: 'PATCH',
  });
  return response.data;
};
