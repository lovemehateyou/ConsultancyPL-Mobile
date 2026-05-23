import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

export default function SignupStepTwoScreen() {
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [legalType, setLegalType] = useState(LEGAL_BUSINESS_TYPES[0]);
  const [sector, setSector] = useState(BUSINESS_SECTORS[0]);
  const [nationalIdFile, setNationalIdFile] = useState('');

  const handleUploadNationalId = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      multiple: false,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    setNationalIdFile(result.assets[0].name);
  };

  const handleCompleteSignup = () => {
    if (!businessName.trim() || !businessAddress.trim() || !nationalIdFile) {
      Alert.alert('Missing information', 'Please complete all business fields and upload your national ID.');
      return;
    }

    router.replace('/(tabs)/home');
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
          <Text style={styles.label}>Business address</Text>
          <TextInput
            style={styles.input}
            value={businessAddress}
            onChangeText={setBusinessAddress}
            placeholder="Business address"
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
          <Text style={styles.label}>National ID (PDF or Image)</Text>
          <Pressable style={styles.uploadButton} onPress={handleUploadNationalId}>
            <Text style={styles.uploadButtonText}>Upload File</Text>
          </Pressable>
          <Text style={styles.fileName}>{nationalIdFile || 'No file selected yet.'}</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={handleCompleteSignup}>
          <Text style={styles.primaryButtonText}>Complete Sign Up</Text>
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
  primaryButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: MERI_COLORS.accent,
    paddingVertical: 14,
    alignItems: 'center',
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
