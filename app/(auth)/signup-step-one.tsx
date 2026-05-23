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

export default function SignupStepOneScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!fullName.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your full name"
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+251..."
              placeholderTextColor={MERI_COLORS.mutedText}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
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
