import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BUSINESS_SECTORS, LEGAL_BUSINESS_TYPES, MERI_COLORS } from '@/constants/meri';
import { useSignupDraft } from '@/context/signup-context';
import { ApiError } from '@/services/api';
import { signup, UploadFile } from '@/services/auth';

export default function SignupStepTwoScreen() {
  const { draft, resetDraft } = useSignupDraft();
  const [businessName, setBusinessName] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessSubCity, setBusinessSubCity] = useState('');
  const [businessWereda, setBusinessWereda] = useState('');
  const [businessKebele, setBusinessKebele] = useState('');
  const [legalType, setLegalType] = useState(LEGAL_BUSINESS_TYPES[0]);
  const [sector, setSector] = useState(BUSINESS_SECTORS[0]);
  const [tin, setTin] = useState('');
  const [nationalIdFile, setNationalIdFile] = useState<UploadFile | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadNationalId = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];
    setNationalIdFile({
      uri: asset.uri,
      name: asset.name ?? 'national-id',
      type: asset.mimeType ?? 'application/octet-stream',
    });
  };

  const handleCompleteSignup = async () => {
    if (!draft.userName.trim() || !draft.email.trim() || !draft.password.trim()) {
      setError('Please complete step 1 before submitting.');
      return;
    }

    if (
      !businessName.trim() ||
      !businessCity.trim() ||
      !businessSubCity.trim() ||
      !businessWereda.trim() ||
      !businessKebele.trim()
    ) {
      setError('Please complete all required business fields.');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await signup({
        userName: draft.userName,
        email: draft.email,
        password: draft.password,
        role: draft.role,
        phoneNumber: draft.phoneNumber,
        userAddress: draft.userAddress,
        BusinessName: businessName,
        BusinessCity: businessCity,
        BusinessSubCity: businessSubCity,
        BusinessWereda: businessWereda,
        BusinessKebele: businessKebele,
        BusinessType: legalType,
        Business: sector,
        TIN: tin.trim() || undefined,
        agreedToTerms: draft.agreedToTerms,
        nationalIdFile: nationalIdFile ?? undefined,
      });
      resetDraft();
      router.replace('/(tabs)/home');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Step 2 of 2 · Business details</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business name</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Your business name"
            placeholderTextColor={MERI_COLORS.mutedText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business city</Text>
          <TextInput
            style={styles.input}
            value={businessCity}
            onChangeText={setBusinessCity}
            placeholder="Business city"
            placeholderTextColor={MERI_COLORS.mutedText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business sub-city</Text>
          <TextInput
            style={styles.input}
            value={businessSubCity}
            onChangeText={setBusinessSubCity}
            placeholder="Business sub-city"
            placeholderTextColor={MERI_COLORS.mutedText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business wereda</Text>
          <TextInput
            style={styles.input}
            value={businessWereda}
            onChangeText={setBusinessWereda}
            placeholder="Business wereda"
            placeholderTextColor={MERI_COLORS.mutedText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business kebele</Text>
          <TextInput
            style={styles.input}
            value={businessKebele}
            onChangeText={setBusinessKebele}
            placeholder="Business kebele"
            placeholderTextColor={MERI_COLORS.mutedText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business legal type</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={legalType} onValueChange={(itemValue) => setLegalType(itemValue)}>
              {LEGAL_BUSINESS_TYPES.map((type) => (
                <Picker.Item label={type} value={type} key={type} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Business sector</Text>
          <View style={styles.pickerWrap}>
            <Picker selectedValue={sector} onValueChange={(itemValue) => setSector(itemValue)}>
              {BUSINESS_SECTORS.map((type) => (
                <Picker.Item label={type} value={type} key={type} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TIN (optional)</Text>
          <TextInput
            style={styles.input}
            value={tin}
            onChangeText={setTin}
            placeholder="Tax identification number"
            placeholderTextColor={MERI_COLORS.mutedText}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>National ID (PDF or Image)</Text>
          <Pressable style={styles.uploadButton} onPress={handleUploadNationalId}>
            <Text style={styles.uploadButtonText}>Upload File</Text>
          </Pressable>
          <Text style={styles.fileName}>{nationalIdFile?.name || 'No file selected yet.'}</Text>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleCompleteSignup}
          disabled={isLoading}>
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Submitting...' : 'Complete Sign Up'}
          </Text>
        </Pressable>

        <Link href="/(auth)/signup-step-one" style={styles.backLink}>
          Back to Step 1
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
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
  pickerWrap: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: MERI_COLORS.background,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: MERI_COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: MERI_COLORS.accent,
    fontWeight: '700',
  },
  fileName: {
    color: MERI_COLORS.mutedText,
    fontSize: 13,
  },
  error: {
    color: MERI_COLORS.danger,
    fontWeight: '500',
  },
  primaryButton: {
    marginTop: 4,
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
  backLink: {
    color: MERI_COLORS.accent,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: 4,
  },
});
