import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { MERI_COLORS } from '@/constants/meri';
import { fetchAvailabilityByConsultant, type AvailabilitySlot } from '@/services/availability';
import { fetchConsultantById, type Consultant } from '@/services/consultants';

export default function ConsultantDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const consultantId = Array.isArray(id) ? id[0] : id;
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!consultantId) {
      setIsLoading(false);
      setConsultant(null);
      return;
    }

    let isActive = true;

    const loadConsultant = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [consultantData, slots] = await Promise.all([
          fetchConsultantById(consultantId),
          fetchAvailabilityByConsultant(consultantId, { status: 'open' }),
        ]);

        if (isActive) {
          setConsultant(consultantData);
          setAvailability(slots);
        }
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load consultant profile.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadConsultant();

    return () => {
      isActive = false;
    };
  }, [consultantId]);

  const formatSlotDate = (value: string) => new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatSlotTime = (value: string) => new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

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
        {consultant.profileImage ? (
          <Image source={{ uri: consultant.profileImage }} style={styles.profileImage} />
        ) : null}
        <Text style={styles.name}>{consultant.name}</Text>
        <Text style={styles.role}>{consultant.businessArea || consultant.businessType || consultant.title || 'Consultant'}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body}>{consultant.about || 'No profile details available yet.'}</Text>
        <Text style={styles.meta}>{consultant.email}</Text>
        {consultant.phone ? <Text style={styles.meta}>{consultant.phone}</Text> : null}
        {consultant.businessCity ? <Text style={styles.meta}>{consultant.businessCity}</Text> : null}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Availability Schedule</Text>
        {availability.length === 0 ? (
          <Text style={styles.meta}>No open slots available yet.</Text>
        ) : (
          availability.map((slot) => (
            <View key={slot.id} style={styles.scheduleRow}>
              <Text style={styles.day}>{formatSlotDate(slot.slotStart)}</Text>
              <Text style={styles.time}>
                {formatSlotTime(slot.slotStart)} - {formatSlotTime(slot.slotEnd)}
              </Text>
              <Text style={styles.available}>Available</Text>
            </View>
          ))
        )}
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
  errorText: {
    color: MERI_COLORS.accent,
    fontSize: 16,
    fontWeight: '600',
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
    gap: 8,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: MERI_COLORS.border,
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
