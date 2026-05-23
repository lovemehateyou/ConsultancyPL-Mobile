import { useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { useAppState } from '@/context/app-state';

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, markTaskComplete, undoTaskComplete } = useAppState();

  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.role}>{task.role}</Text>

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
        <Pressable style={styles.completeButton} onPress={() => markTaskComplete(task.id)}>
          <Text style={styles.completeText}>Action Completed</Text>
        </Pressable>
        <Pressable style={styles.undoButton} onPress={() => undoTaskComplete(task.id)}>
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
      </View>
    </ScrollView>
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
});
