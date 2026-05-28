import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { MERI_COLORS } from '@/constants/meri';
import { useAppState } from '@/context/app-state';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, markTaskComplete, undoTaskComplete, isLoading, errorMessage } = useAppState();
  const [isUpdating, setIsUpdating] = useState(false);

  const task = tasks.find((item) => item.id === id);

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

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Task not found</Text>
      </View>
    );
  }

  const isCompleted = task.completed;

  const handleComplete = async () => {
    if (isUpdating || isCompleted) {
      return;
    }

    setIsUpdating(true);
    await markTaskComplete(task.id);
    setIsUpdating(false);
  };

  const handleUndo = async () => {
    if (isUpdating || !isCompleted) {
      return;
    }

    setIsUpdating(true);
    await undoTaskComplete(task.id);
    setIsUpdating(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Task Details',
          headerLeft: () => (
            <Pressable style={styles.headerBackButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={MERI_COLORS.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.role}>{task.role}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusPill, isCompleted ? styles.statusPillDone : styles.statusPillActive]}>
            <Text style={[styles.statusText, isCompleted ? styles.statusTextDone : styles.statusTextActive]}>
              {isCompleted ? 'Completed' : 'Active'}
            </Text>
          </View>
          {isUpdating ? <Text style={styles.statusMeta}>Updating...</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Task Description</Text>
          <Text style={styles.bodyText}>{task.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Asset Files</Text>
          {task.assets.length ? (
            task.assets.map((asset) => (
              <Pressable key={asset.name} style={styles.assetItem} onPress={() => Linking.openURL(asset.url)}>
                <Text style={styles.assetName}>{asset.name}</Text>
                <Text style={styles.assetLink}>Open</Text>
              </Pressable>
            ))
          ) : (
            <Text style={styles.bodyText}>No asset files associated with this task.</Text>
          )}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.completeButton, (isCompleted || isUpdating) && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={isCompleted || isUpdating}
          >
            <Text style={styles.completeText}>{isCompleted ? 'Completed' : 'Mark Completed'}</Text>
          </Pressable>
          <Pressable
            style={[styles.undoButton, (!isCompleted || isUpdating) && styles.buttonDisabled]}
            onPress={handleUndo}
            disabled={!isCompleted || isUpdating}
          >
            <Text style={styles.undoText}>Undo</Text>
          </Pressable>
        </View>
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
  role: {
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
  assetItem: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assetName: {
    color: MERI_COLORS.text,
    fontWeight: '600',
  },
  assetLink: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
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
    paddingVertical: 12,
  },
  completeText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
  },
  undoButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: MERI_COLORS.accent,
    alignItems: 'center',
    paddingVertical: 12,
  },
  undoText: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  headerBackButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
