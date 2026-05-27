import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { fetchBookings, type BookingListItem } from '@/services/bookings';

export default function HistoryScreen() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadBookings = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchBookings();
        if (isActive) {
          setBookings(data);
        }
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load history.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      isActive = false;
    };
  }, []);

  const formatDate = (value?: string | null) => {
    if (!value) {
      return '--';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '--';
    }

    return date.toLocaleDateString(undefined, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const getDisplayName = (item: BookingListItem) => {
    return item.consultant?.name || item.user?.name || 'Unknown';
  };

  const getDisplayUsername = (item: BookingListItem) => {
    return item.consultant?.email || item.user?.email || '';
  };

  const getStatusMeta = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized === 'completed') {
      return { label: 'Completed', style: styles.completed };
    }
    if (normalized === 'declined' || normalized === 'cancelled') {
      return { label: 'Cancelled', style: styles.cancelled };
    }
    if (normalized === 'accepted' || normalized === 'pending') {
      return { label: 'Upcoming', style: styles.upcoming };
    }
    return { label: normalized || 'Unknown', style: styles.statusDefault };
  };

  const getStageLabel = (status: string) => {
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'accepted':
        return 'Approved';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'declined':
        return 'Declined';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const rows = useMemo(() => {
    return bookings.map((item) => {
      const statusMeta = getStatusMeta(item.status ?? '');
      return {
        id: item.id,
        name: getDisplayName(item),
        username: getDisplayUsername(item),
        date: formatDate(item.slotStart || item.appointmentDate || null),
        statusLabel: statusMeta.label,
        statusStyle: statusMeta.style,
        stageLabel: getStageLabel(item.status ?? ''),
      };
    });
  }, [bookings]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>History</Text>

      <View style={styles.headerRow}>
        <Text style={[styles.colHead, styles.colName]}>Name</Text>
        <Text style={styles.colHead}>Date</Text>
        <Text style={styles.colHead}>Status</Text>
        <Text style={styles.colHead}>Stage</Text>
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={MERI_COLORS.accent} />
          <Text style={styles.stateText}>Loading history...</Text>
        </View>
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : rows.length === 0 ? (
        <Text style={styles.emptyText}>No bookings yet.</Text>
      ) : (
        rows.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.colName}>
              <Text style={styles.name}>{item.name}</Text>
              {item.username ? <Text style={styles.username}>{item.username}</Text> : null}
            </View>
            <Text style={styles.colText}>{item.date}</Text>
            <Text style={[styles.colText, item.statusStyle]}>{item.statusLabel}</Text>
            <Text style={styles.colText}>{item.stageLabel}</Text>
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
    gap: 12,
  },
  heading: {
    color: MERI_COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    padding: 10,
    backgroundColor: MERI_COLORS.card,
  },
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  colHead: {
    flex: 1,
    color: MERI_COLORS.mutedText,
    fontWeight: '700',
    fontSize: 12,
  },
  colName: {
    flex: 1.3,
  },
  colText: {
    flex: 1,
    color: MERI_COLORS.text,
    fontSize: 12,
  },
  name: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  username: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  upcoming: {
    color: '#15803D',
    fontWeight: '700',
  },
  completed: {
    color: MERI_COLORS.success,
    fontWeight: '700',
  },
  cancelled: {
    color: MERI_COLORS.danger,
    fontWeight: '700',
  },
  statusDefault: {
    color: MERI_COLORS.mutedText,
    fontWeight: '700',
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
});
