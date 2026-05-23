import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { HISTORY_ITEMS } from '@/data/app-data';

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>History</Text>

      <View style={styles.headerRow}>
        <Text style={[styles.colHead, styles.colName]}>Name</Text>
        <Text style={styles.colHead}>Date</Text>
        <Text style={styles.colHead}>Status</Text>
        <Text style={styles.colHead}>Stage</Text>
      </View>

      {HISTORY_ITEMS.map((item) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.colName}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.username}>{item.username}</Text>
          </View>
          <Text style={styles.colText}>{item.date}</Text>
          <Text style={[styles.colText, item.status === 'Passed' ? styles.passed : styles.upcoming]}>{item.status}</Text>
          <Text style={styles.colText}>{item.stage}</Text>
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
  passed: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
