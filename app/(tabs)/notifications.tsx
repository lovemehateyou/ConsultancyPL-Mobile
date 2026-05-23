import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { NOTIFICATIONS } from '@/data/app-data';

export default function NotificationsScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          <Text style={styles.subtitle}>You have 3 unread notifications</Text>
        </View>
        <Pressable style={styles.readAllButton}>
          <Text style={styles.readAllText}>Mark all as read</Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        <Text style={styles.tab}>All (6)</Text>
        <Text style={styles.tab}>Unread (3)</Text>
        <Text style={styles.tab}>Read (3)</Text>
      </View>

      {NOTIFICATIONS.map((item) => (
        <View key={item.id} style={[styles.notificationCard, item.isNew ? styles.newBorder : undefined]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.isNew ? <Text style={styles.newTag}>New</Text> : null}
          </View>
          <Text style={styles.cardBody}>{item.text}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.time}>{item.time}</Text>
            {item.isNew ? <Text style={styles.markRead}>Mark as read</Text> : null}
          </View>
        </View>
      ))}
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
});
