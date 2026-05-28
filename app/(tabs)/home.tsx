import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { useAppState } from '@/context/app-state';

export default function HomeTabScreen() {
  const { tasks, completedCount, progressPercent, isLoading, errorMessage, refreshTasks } = useAppState();

  const stats = [
    { label: 'Total Tasks', value: String(tasks.length) },
    { label: 'Tasks Completed', value: String(completedCount) },
    { label: 'Tasks Left', value: String(tasks.length - completedCount) },
    { label: 'Progress', value: `${progressPercent}%` },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Dashboard Overview</Text>
      <Text style={styles.subheading}>Key metrics and progress for your business tasks.</Text>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.progressText}>{progressPercent}% completed · {100 - progressPercent}% remaining</Text>
      </View>

      <Text style={styles.sectionTitle}>Active Tasks</Text>
      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={MERI_COLORS.accent} />
          <Text style={styles.stateText}>Loading tasks...</Text>
        </View>
      ) : errorMessage ? (
        <View style={styles.stateCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable style={styles.retryButton} onPress={refreshTasks}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.stateCard}>
          <Text style={styles.emptyText}>No active tasks yet.</Text>
        </View>
      ) : (
        tasks.map((task) => (
          <Pressable key={task.id} style={styles.taskRow} onPress={() => router.push(`/(tabs)/task/${task.id}`)}>
            <View>
              <Text style={styles.taskName}>{task.title}</Text>
              <Text style={styles.taskRole}>{task.role}</Text>
            </View>
            <View style={[styles.badge, task.completed ? styles.badgeDone : styles.badgeActive]}>
              <Text style={task.completed ? styles.doneText : styles.activeText}>{task.completed ? 'Completed' : 'Active'}</Text>
            </View>
          </Pressable>
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
    gap: 14,
  },
  heading: {
    color: MERI_COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subheading: {
    color: MERI_COLORS.mutedText,
    marginTop: -4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.5%',
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: MERI_COLORS.card,
    gap: 6,
  },
  statLabel: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  statValue: {
    color: MERI_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  progressCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    color: MERI_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    overflow: 'hidden',
  },
  progressFill: {
    width: '40%',
    backgroundColor: MERI_COLORS.accent,
    height: '100%',
  },
  progressText: {
    color: MERI_COLORS.mutedText,
    fontSize: 13,
  },
  stateCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  stateText: {
    color: MERI_COLORS.mutedText,
  },
  errorText: {
    color: MERI_COLORS.danger,
    fontWeight: '600',
  },
  retryButton: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    color: MERI_COLORS.text,
    fontWeight: '600',
  },
  emptyText: {
    color: MERI_COLORS.mutedText,
  },
  taskRow: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskName: {
    color: MERI_COLORS.text,
    fontWeight: '600',
    marginBottom: 3,
  },
  taskRole: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeActive: {
    backgroundColor: '#DBEAFE',
  },
  badgeDone: {
    backgroundColor: '#DCFCE7',
  },
  activeText: {
    color: MERI_COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  doneText: {
    color: MERI_COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
});
