import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from '@/services/notifications';

type TabKey = 'all' | 'unread' | 'read';

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadNotifications = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchNotifications({ limit: 100 });
        if (isActive) {
          setNotifications(data);
        }
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load notifications.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isActive = false;
    };
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') {
      return notifications.filter((item) => !item.read);
    }
    if (activeTab === 'read') {
      return notifications.filter((item) => item.read);
    }
    return notifications;
  }, [activeTab, notifications]);

  const formatTime = (value?: string) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d ago`;
    }
    return date.toLocaleDateString();
  };

  const getTitle = (item: NotificationItem) => {
    switch (item.type) {
      case 'booking_request':
        return 'New booking request';
      case 'booking_update':
        return 'Booking update';
      default:
        return 'Notification';
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    setIsUpdating(true);
    setErrorMessage(null);

    try {
      const updated = await markNotificationRead(notificationId);
      setNotifications((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to mark notification as read.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);

    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to mark all as read.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          <Text style={styles.subtitle}>You have {unreadCount} unread notifications</Text>
        </View>
        <Pressable style={[styles.readAllButton, isUpdating && styles.buttonDisabled]} onPress={handleMarkAllRead} disabled={isUpdating}>
          <Text style={styles.readAllText}>Mark all as read</Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        {[
          { key: 'all' as const, label: `All (${notifications.length})` },
          { key: 'unread' as const, label: `Unread (${unreadCount})` },
          { key: 'read' as const, label: `Read (${notifications.length - unreadCount})` },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tab, isActive && styles.tabActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={MERI_COLORS.accent} />
          <Text style={styles.stateText}>Loading notifications...</Text>
        </View>
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : filteredNotifications.length === 0 ? (
        <Text style={styles.emptyText}>No notifications to show.</Text>
      ) : (
        filteredNotifications.map((item) => (
          <View key={item.id} style={[styles.notificationCard, !item.read ? styles.newBorder : undefined]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{getTitle(item)}</Text>
              {!item.read ? <Text style={styles.newTag}>New</Text> : null}
            </View>
            <Text style={styles.cardBody}>{item.message}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
              {!item.read ? (
                <Pressable onPress={() => handleMarkRead(item.id)} disabled={isUpdating}>
                  <Text style={styles.markRead}>Mark as read</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
  },
  container: {
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    color: MERI_COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: MERI_COLORS.mutedText,
    marginTop: 2,
  },
  readAllButton: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  readAllText: {
    color: MERI_COLORS.text,
    fontWeight: '600',
    fontSize: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    padding: 8,
    gap: 14,
  },
  tab: {
    color: MERI_COLORS.mutedText,
    fontWeight: '600',
  },
  tabActive: {
    color: MERI_COLORS.accent,
  },
  notificationCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  newBorder: {
    borderLeftWidth: 3,
    borderLeftColor: MERI_COLORS.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  newTag: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 12,
  },
  cardBody: {
    color: MERI_COLORS.mutedText,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  markRead: {
    color: MERI_COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  stateCard: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  stateText: {
    color: MERI_COLORS.mutedText,
    fontWeight: '600',
  },
  errorText: {
    color: MERI_COLORS.accent,
    fontWeight: '600',
  },
  emptyText: {
    color: MERI_COLORS.mutedText,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
