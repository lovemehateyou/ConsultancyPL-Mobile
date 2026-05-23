import { ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';

export default function ProfileTabScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>User Profile</Text>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <TextInput style={styles.input} placeholder="User Name" placeholderTextColor={MERI_COLORS.mutedText} />
        <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor={MERI_COLORS.mutedText} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor={MERI_COLORS.mutedText} />
        <TextInput style={styles.input} placeholder="Business Name" placeholderTextColor={MERI_COLORS.mutedText} />
        <TextInput style={styles.input} placeholder="Business Address" placeholderTextColor={MERI_COLORS.mutedText} />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Consultation Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryMetric}>4 Approved</Text>
          <Text style={styles.summaryMetric}>9 Requested</Text>
          <Text style={styles.summaryMetric}>3 Left</Text>
        </View>
        <Text style={styles.summaryText}>Name: User Name</Text>
        <Text style={styles.summaryText}>Phone: +251 9XX XXX XXX</Text>
        <Text style={styles.summaryText}>Email: user@meri.com</Text>
      </View>

      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Old Password"
          placeholderTextColor={MERI_COLORS.mutedText}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor={MERI_COLORS.mutedText}
          secureTextEntry
        />

        <View style={styles.buttonRow}>
          <Pressable style={styles.saveButton}>
            <Text style={styles.saveText}>Save Changes</Text>
          </Pressable>
          <Pressable style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
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
  sectionBox: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  sectionTitle: {
    color: MERI_COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: MERI_COLORS.text,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: MERI_COLORS.card,
  },
  summaryTitle: {
    color: MERI_COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryMetric: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
    fontSize: 12,
  },
  summaryText: {
    color: MERI_COLORS.mutedText,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: MERI_COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: MERI_COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
  },
});
