import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Modal } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';
import { CONSULTANTS, ConsultantItem } from '@/data/app-data';

export default function ConsultantTabScreen() {
  const [category, setCategory] = useState('All Categories');
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<ConsultantItem | null>(null);

  const openBookingPopup = (consultant: ConsultantItem) => {
    setSelectedConsultant(consultant);
    setPopupVisible(true);
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
        <TextInput placeholder="mm/dd/yyyy" style={styles.input} placeholderTextColor={MERI_COLORS.mutedText} />
      </View>

      {CONSULTANTS.map((person) => (
        <Pressable key={person.id} style={styles.consultantCard} onPress={() => router.push(`/(tabs)/consultant/${person.id}`)}>
          <View style={styles.personInfo}>
            <Text style={styles.name}>{person.name}</Text>
            <Text style={styles.role}>{person.role}</Text>
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
      ))}

      <Modal transparent visible={popupVisible} animationType="fade" onRequestClose={() => setPopupVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Availability</Text>

            <View style={styles.rowHeader}>
              <Text style={[styles.rowCol, styles.rowColWide]}>Day</Text>
              <Text style={styles.rowCol}>Start</Text>
              <Text style={styles.rowCol}>End</Text>
              <Text style={styles.rowCol}>Status</Text>
            </View>

            {selectedConsultant?.availability.map((slot) => (
              <View key={`${slot.day}-${slot.startTime}`} style={styles.rowBody}>
                <Text style={[styles.rowCol, styles.rowColWide]}>{slot.day}</Text>
                <Text style={styles.rowCol}>{slot.startTime}</Text>
                <Text style={styles.rowCol}>{slot.endTime}</Text>
                <Pressable style={[styles.slotButton, slot.available ? styles.slotBook : styles.slotCant]}>
                  <Text style={styles.slotText}>{slot.available ? 'Book' : 'Cant Book'}</Text>
                </Pressable>
              </View>
            ))}

            <Pressable style={styles.closeButton} onPress={() => setPopupVisible(false)}>
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
