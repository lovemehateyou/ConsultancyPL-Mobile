import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { CONSULTANTS } from '@/data/app-data';

export default function ConsultantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const consultant = CONSULTANTS.find((item) => item.id === id);

  if (!consultant) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Consultant not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.name}>{consultant.name}</Text>
        <Text style={styles.role}>{consultant.role}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>{consultant.bio}</Text>
        <Text style={styles.meta}>{consultant.email}</Text>
        <Text style={styles.meta}>{consultant.username}</Text>
        <Text style={styles.meta}>{consultant.city}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Availability Schedule</Text>
        {consultant.availability.map((slot) => (
          <View key={`${slot.day}-${slot.startTime}`} style={styles.scheduleRow}>
            <Text style={styles.day}>{slot.day}</Text>
            <Text style={styles.time}>{slot.startTime} - {slot.endTime}</Text>
            <Text style={slot.available ? styles.available : styles.notAvailable}>
              {slot.available ? 'Available' : 'Not Available'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Consultants Testimonials</Text>
        <Text style={styles.body}>
          “We love working with this consultant. Their practical guidance helped us improve decision quality and execution speed.”
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Consultant Review</Text>
        <Text style={styles.meta}>Rate out of 5: ☆ ☆ ☆ ☆ ☆</Text>
        <Text style={styles.meta}>Description:</Text>
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
    gap: 12,
  },
  headerCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: MERI_COLORS.card,
  },
  name: {
    color: MERI_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  role: {
    color: MERI_COLORS.mutedText,
    marginTop: 2,
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    color: MERI_COLORS.text,
    fontWeight: '700',
    fontSize: 17,
  },
  body: {
    color: MERI_COLORS.text,
    lineHeight: 22,
  },
  meta: {
    color: MERI_COLORS.mutedText,
  },
  scheduleRow: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  day: {
    color: MERI_COLORS.text,
    fontWeight: '700',
  },
  time: {
    color: MERI_COLORS.mutedText,
  },
  available: {
    color: '#059669',
    fontWeight: '700',
  },
  notAvailable: {
    color: '#DC2626',
    fontWeight: '700',
  },
});
