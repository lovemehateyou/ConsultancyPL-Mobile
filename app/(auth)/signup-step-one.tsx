import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MERI_COLORS } from '@/constants/meri';
import { useSignupDraft } from '@/context/signup-context';

export default function SignupStepOneScreen() {
  const { draft, updateDraft } = useSignupDraft();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (
      !draft.userName.trim() ||
      !draft.phoneNumber.trim() ||
      !draft.email.trim() ||
      !draft.password.trim() ||
      !confirmPassword.trim() ||
      !draft.userAddress.trim()
    ) {
      setError('Please fill out all required fields.');
      return;
    }

    if (draft.password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!draft.agreedToTerms) {
      setError('Please accept the terms and conditions.');
      return;
    }

    setError('');
    router.push('/(auth)/signup-step-two');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Step 1 of 2 · Personal details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              value={draft.userName}
              onChangeText={(value) => updateDraft({ userName: value })}
              placeholder="Your full name"
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              value={draft.phoneNumber}
              onChangeText={(value) => updateDraft({ phoneNumber: value })}
              keyboardType="phone-pad"
              placeholder="+251..."
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={draft.email}
              onChangeText={(value) => updateDraft({ email: value })}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Create password</Text>
            <TextInput
              style={styles.input}
              value={draft.password}
              onChangeText={(value) => updateDraft({ password: value })}
              secureTextEntry
              placeholder="Create password"
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Confirm password"
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={draft.userAddress}
              onChangeText={(value) => updateDraft({ userAddress: value })}
              placeholder="Your address"
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => updateDraft({ agreedToTerms: !draft.agreedToTerms })}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: draft.agreedToTerms }}>
            <View style={[styles.checkbox, draft.agreedToTerms && styles.checkboxChecked]}>
              {draft.agreedToTerms && <View style={styles.checkboxIndicator} />}
            </View>
            <Text style={styles.checkboxText}>I agree to the terms and conditions</Text>
          </Pressable>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <Pressable style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" style={styles.footerLink}>
              Log In
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
  },
  keyboardArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 14,
  },
  title: {
    color: MERI_COLORS.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: MERI_COLORS.mutedText,
    marginBottom: 6,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: MERI_COLORS.text,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: MERI_COLORS.text,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MERI_COLORS.background,
  },
  checkboxChecked: {
    borderColor: MERI_COLORS.accent,
  },
  checkboxIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: MERI_COLORS.accent,
  },
  checkboxText: {
    color: MERI_COLORS.text,
    fontSize: 13,
  },
  error: {
    color: MERI_COLORS.danger,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: MERI_COLORS.accent,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  primaryButtonText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: MERI_COLORS.mutedText,
  },
  footerLink: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
  },
});
