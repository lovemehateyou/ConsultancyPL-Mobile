import { router } from 'expo-router';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { fetchAvailabilityByConsultant, type AvailabilitySlot } from '@/services/availability';
import { createBooking } from '@/services/bookings';
import { fetchConsultants, type Consultant } from '@/services/consultants';

export default function ConsultantTabScreen() {
  const [category, setCategory] = useState('All Categories');
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [search, setSearch] = useState('');
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadConsultants = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchConsultants({ search: search.trim() ? search.trim() : undefined });
        if (isActive) {
          setConsultants(data);
        }
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load consultants.');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const debounceHandle = setTimeout(loadConsultants, 250);

    return () => {
      isActive = false;
      clearTimeout(debounceHandle);
    };
  }, [search]);

  useEffect(() => {
    if (!popupVisible || !selectedConsultant) {
      return;
    }

    let isActive = true;

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        const slots = await fetchAvailabilityByConsultant(selectedConsultant.id, { status: 'open' });
        if (isActive) {
          setAvailability(slots);
        }
      } catch (err) {
        if (isActive) {
          setAvailabilityError(err instanceof Error ? err.message : 'Failed to load availability.');
        }
      } finally {
        if (isActive) {
          setAvailabilityLoading(false);
        }
      }
    };

    loadAvailability();

    return () => {
      isActive = false;
    };
  }, [popupVisible, selectedConsultant]);

  const visibleConsultants = useMemo(() => {
    if (category === 'All Categories') {
      return consultants;
    }

    const query = category.toLowerCase();
    return consultants.filter((consultant) => {
      return [consultant.businessArea, consultant.businessType, consultant.title]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query));
    });
  }, [category, consultants]);

  const openBookingPopup = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setPopupVisible(true);
  };

  const closeBookingPopup = () => {
    setPopupVisible(false);
    setAvailability([]);
    setAvailabilityError(null);
    setBookingSlotId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  const formatSlotDate = (value: string) => new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatSlotTime = (value: string) => new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleBookSlot = async (slot: AvailabilitySlot) => {
    if (!selectedConsultant) {
      return;
    }

    setBookingSlotId(slot.id);
    setAvailabilityError(null);

    try {
      const result = await createBooking({
        consultantId: selectedConsultant.id,
        availabilityId: slot.id,
      });

      if (result.payment?.checkout_url) {
        await Linking.openURL(result.payment.checkout_url);
      }

      setAvailability((prev) => prev.filter((item) => item.id !== slot.id));
    } catch (err) {
      setAvailabilityError(err instanceof Error ? err.message : 'Failed to create booking.');
    } finally {
      setBookingSlotId(null);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Live Consultancy</Text>

      <View style={styles.filterBox}>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)}>
            <Picker.Item label="All Categories" value="All Categories" />
            <Picker.Item label="Law" value="Law" />
            <Picker.Item label="Finance" value="Finance" />
            <Picker.Item label="Business" value="Business" />
          </Picker>
        </View>
        <TextInput
          placeholder="Search by name or specialty"
          style={styles.input}
          placeholderTextColor={MERI_COLORS.mutedText}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.stateCard}>
          <ActivityIndicator color={MERI_COLORS.accent} />
          <Text style={styles.stateText}>Loading consultants...</Text>
        </View>
      ) : errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : visibleConsultants.length === 0 ? (
        <Text style={styles.emptyText}>No consultants match your filters.</Text>
      ) : (
        visibleConsultants.map((person) => (
          <Pressable key={person.id} style={styles.consultantCard} onPress={() => router.push(`/(tabs)/consultant/${person.id}`)}>
            <View style={styles.avatar}>
              {person.profileImage ? (
                <Image source={{ uri: person.profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials(person.name)}</Text>
              )}
            </View>
            <View style={styles.personInfo}>
              <Text style={styles.name}>{person.name}</Text>
              <Text style={styles.role}>{person.businessArea || person.businessType || person.title || 'Consultant'}</Text>
              <Text style={styles.email}>{person.email}</Text>
            </View>
            <Pressable
              style={styles.bookButton}
              onPress={(event) => {
                event.stopPropagation();
                openBookingPopup(person);
              }}>
              <Text style={styles.bookText}>Book</Text>
            </Pressable>
          </Pressable>
        ))
      )}

      <Modal transparent visible={popupVisible} animationType="fade" onRequestClose={closeBookingPopup}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Availability</Text>

            <View style={styles.rowHeader}>
              <Text style={[styles.rowCol, styles.rowColWide]}>Day</Text>
              <Text style={styles.rowCol}>Start</Text>
              <Text style={styles.rowCol}>End</Text>
              <Text style={styles.rowCol}>Status</Text>
            </View>

            {availabilityLoading ? (
              <View style={styles.modalStateCard}>
                <ActivityIndicator color={MERI_COLORS.accent} />
                <Text style={styles.stateText}>Loading availability...</Text>
              </View>
            ) : availabilityError ? (
              <Text style={styles.errorText}>{availabilityError}</Text>
            ) : availability.length === 0 ? (
              <Text style={styles.emptyText}>No open slots yet.</Text>
            ) : (
              availability.map((slot) => (
                <View key={slot.id} style={styles.rowBody}>
                  <Text style={[styles.rowCol, styles.rowColWide]}>{formatSlotDate(slot.slotStart)}</Text>
                  <Text style={styles.rowCol}>{formatSlotTime(slot.slotStart)}</Text>
                  <Text style={styles.rowCol}>{formatSlotTime(slot.slotEnd)}</Text>
                  <Pressable
                    style={[styles.slotButton, styles.slotBook]}
                    disabled={bookingSlotId === slot.id}
                    onPress={() => handleBookSlot(slot)}>
                    <Text style={styles.slotText}>{bookingSlotId === slot.id ? 'Booking...' : 'Book'}</Text>
                  </Pressable>
                </View>
              ))
            )}

            <Pressable style={styles.closeButton} onPress={closeBookingPopup}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  filterBox: {
    gap: 10,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: MERI_COLORS.text,
  },
  consultantCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    height: 46,
    width: 46,
    borderRadius: 23,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    height: 46,
    width: 46,
    borderRadius: 23,
  },
  avatarText: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
  },
  personInfo: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  name: {
    color: MERI_COLORS.text,
    fontWeight: '700',
  },
  role: {
    color: MERI_COLORS.mutedText,
  },
  email: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
  },
  bookButton: {
    backgroundColor: MERI_COLORS.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  bookText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: MERI_COLORS.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    padding: 14,
    gap: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: MERI_COLORS.text,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowCol: {
    flex: 1,
    color: MERI_COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  rowColWide: {
    flex: 1.2,
  },
  slotButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 76,
    alignItems: 'center',
  },
  slotBook: {
    backgroundColor: MERI_COLORS.success,
  },
  slotCant: {
    backgroundColor: MERI_COLORS.danger,
  },
  slotText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
    fontSize: 12,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 6,
    backgroundColor: MERI_COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
  },
  stateCard: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  modalStateCard: {
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
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
