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
import { ApiError } from '@/services/api';
import { login } from '@/services/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await login({ email, password });
      router.replace('/(tabs)/home');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.logo}>MERI</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to access Ethiopian business resources and consultants.</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor={MERI_COLORS.mutedText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                style={styles.input}
                placeholderTextColor={MERI_COLORS.mutedText}
              />
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}>
              <Text style={styles.primaryButtonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <Link href="/(auth)/signup-step-one" style={styles.signupLink}>
                Sign Up
              </Link>
            </View>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 16,
    padding: 20,
    backgroundColor: MERI_COLORS.background,
    gap: 14,
  },
  logo: {
    color: MERI_COLORS.accent,
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    color: MERI_COLORS.text,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: MERI_COLORS.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: MERI_COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: MERI_COLORS.text,
    fontSize: 15,
  },
  error: {
    color: MERI_COLORS.danger,
    fontWeight: '500',
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 10,
    backgroundColor: MERI_COLORS.accent,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
    fontSize: 15,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    color: MERI_COLORS.mutedText,
  },
  signupLink: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
  },
});
