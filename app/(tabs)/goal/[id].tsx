import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { MERI_COLORS } from '@/constants/meri';
import { useAppState } from '@/context/app-state';

export default function GoalDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, markTaskComplete, undoTaskComplete, isLoading, errorMessage } = useAppState();
  const [updatingTaskIds, setUpdatingTaskIds] = useState<Set<string>>(new Set());

  const goal = goals.find((item) => String(item.id) === id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={MERI_COLORS.accent} />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Goal not found</Text>
      </View>
    );
  }

  const completedCount = goal.tasks.filter((task) => task.completed).length;
  const totalCount = goal.tasks.length;
  const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const isGoalCompleted = goal.status === 'completed';

  const getGoalStatusLabel = (status: string) => {
    if (status === 'completed') {
      return 'Completed';
    }

    if (status === 'not_started') {
      return 'Not Started';
    }

    return 'In Progress';
  };

  const setTaskUpdating = (taskId: string, isUpdating: boolean) => {
    setUpdatingTaskIds((previous) => {
      const next = new Set(previous);
      if (isUpdating) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
  };

  const handleComplete = async (taskId: string, isCompleted: boolean) => {
    if (isCompleted || updatingTaskIds.has(taskId)) {
      return;
    }

    setTaskUpdating(taskId, true);
    await markTaskComplete(taskId);
    setTaskUpdating(taskId, false);
  };

  const handleUndo = async (taskId: string, isCompleted: boolean) => {
    if (!isCompleted || updatingTaskIds.has(taskId)) {
      return;
    }

    setTaskUpdating(taskId, true);
    await undoTaskComplete(taskId);
    setTaskUpdating(taskId, false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Goal Details',
          headerLeft: () => (
            <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={MERI_COLORS.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.title}>{goal.title}</Text>
        <Text style={styles.category}>{goal.category}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusPill, isGoalCompleted ? styles.statusPillDone : styles.statusPillActive]}>
            <Text style={[styles.statusText, isGoalCompleted ? styles.statusTextDone : styles.statusTextActive]}>
              {getGoalStatusLabel(goal.status)}
            </Text>
          </View>
          <Text style={styles.statusMeta}>{progressPercent}% complete</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Goal Summary</Text>
          <Text style={styles.bodyText}>
            {goal.description ? goal.description : 'No description available for this goal.'}
          </Text>
          <Text style={styles.metaText}>{completedCount} of {totalCount} tasks completed</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                isGoalCompleted && styles.progressFillDone,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tasks</Text>
        {goal.tasks.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.bodyText}>No tasks assigned to this goal yet.</Text>
          </View>
        ) : (
          goal.tasks.map((task, index) => {
            const isCompleted = task.completed;
            const isUpdating = updatingTaskIds.has(task.id);

            return (
              <View key={task.id} style={styles.taskCard}>
                <Pressable style={styles.taskInfo} onPress={() => router.push(`/(tabs)/task/${task.id}`)}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskStep}>Step {task.stepOrder ?? index + 1}</Text>
                </Pressable>
                <View style={styles.taskStatusRow}>
                  <View style={[styles.statusPill, isCompleted ? styles.statusPillDone : styles.statusPillActive]}>
                    <Text style={[styles.statusText, isCompleted ? styles.statusTextDone : styles.statusTextActive]}>
                      {isCompleted ? 'Completed' : 'Active'}
                    </Text>
                  </View>
                  {isUpdating ? <Text style={styles.statusMeta}>Updating...</Text> : null}
                </View>
                <View style={styles.actionsRow}>
                  <Pressable
                    style={[styles.completeButton, (isCompleted || isUpdating) && styles.buttonDisabled]}
                    onPress={() => handleComplete(task.id, isCompleted)}
                    disabled={isCompleted || isUpdating}
                  >
                    <Text style={styles.completeText}>{isCompleted ? 'Completed' : 'Mark Completed'}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.undoButton, (!isCompleted || isUpdating) && styles.buttonDisabled]}
                    onPress={() => handleUndo(task.id, isCompleted)}
                    disabled={!isCompleted || isUpdating}
                  >
                    <Text style={styles.undoText}>Undo</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MERI_COLORS.background,
  },
  notFoundTitle: {
    color: MERI_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  errorText: {
    color: MERI_COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    padding: 16,
    gap: 14,
  },
  title: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 24,
  },
  category: {
    color: MERI_COLORS.mutedText,
    marginTop: -2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusPillActive: {
    backgroundColor: '#DBEAFE',
  },
  statusPillDone: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextActive: {
    color: MERI_COLORS.accent,
  },
  statusTextDone: {
    color: MERI_COLORS.success,
  },
  statusMeta: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  bodyText: {
    color: MERI_COLORS.mutedText,
    lineHeight: 22,
  },
  metaText: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: MERI_COLORS.accent,
  },
  progressFillDone: {
    backgroundColor: MERI_COLORS.success,
  },
  taskCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  taskInfo: {
    gap: 4,
  },
  taskTitle: {
    color: MERI_COLORS.text,
    fontWeight: '600',
  },
  taskStep: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  taskStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  completeButton: {
    flex: 1,
    backgroundColor: MERI_COLORS.accent,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  completeText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
    fontSize: 12,
  },
  undoButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MERI_COLORS.accent,
    alignItems: 'center',
    paddingVertical: 10,
  },
  undoText: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  headerBackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
