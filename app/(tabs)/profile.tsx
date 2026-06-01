import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { MERI_COLORS } from '@/constants/meri';
import { logout } from '@/services/auth';
import { fetchBookings } from '@/services/bookings';
import { changePassword, fetchProfile, updateProfile, type ProfileUpdatePayload, type UploadFile } from '@/services/profile';
import { assignMatchingGoals, fetchMyGoals, type UserGoal } from '@/services/task';

type TabKey = 'personal' | 'business' | 'security';

type ProfileForm = {
  name: string;
  phone: string;
  email: string;
  businessName: string;
  businessCity: string;
  businessSubCity: string;
  businessWereda: string;
  businessKebele: string;
  businessType: string;
  businessArea: string;
  tin: string;
  profileImage?: string | null;
};

type PendingProfileImage = UploadFile;

const EMPTY_PROFILE: ProfileForm = {
  name: '',
  phone: '',
  email: '',
  businessName: '',
  businessCity: '',
  businessSubCity: '',
  businessWereda: '',
  businessKebele: '',
  businessType: '',
  businessArea: '',
  tin: '',
  profileImage: null,
};

type StatItem = {
  label: string;
  value: number;
  color: string;
};

const DEFAULT_STATS: StatItem[] = [
  { label: 'Approved', value: 0, color: MERI_COLORS.success },
  { label: 'Requests', value: 0, color: MERI_COLORS.accent },
  { label: 'Tasks', value: 0, color: '#F59E0B' },
];

export default function ProfileTabScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [profile, setProfile] = useState<ProfileForm>(EMPTY_PROFILE);
  const [initialProfile, setInitialProfile] = useState<ProfileForm>(EMPTY_PROFILE);
  const [pendingImage, setPendingImage] = useState<PendingProfileImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [nextPassword, setNextPassword] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [user, bookings, initialGoals] = await Promise.all([
          fetchProfile(),
          fetchBookings(),
          fetchMyGoals(),
        ]);
        if (!isActive) {
          return;
        }

        let goals: UserGoal[] = initialGoals;
        if (goals.length === 0) {
          await assignMatchingGoals();
          goals = await fetchMyGoals();
        }

        const normalized: ProfileForm = {
          name: user.name ?? '',
          phone: user.phone ?? '',
          email: user.email ?? '',
          businessName: user.businessName ?? '',
          businessCity: user.businessCity ?? '',
          businessSubCity: user.businessSubCity ?? '',
          businessWereda: user.businessWereda ?? '',
          businessKebele: user.businessKebele ?? '',
          businessType: user.businessType ?? '',
          businessArea: user.businessArea ?? '',
          tin: user.tin ?? '',
          profileImage: user.profileImage ?? null,
        };

        setProfile(normalized);
        setInitialProfile(normalized);

        const approvedCount = bookings.filter((booking) =>
          booking.status === 'accepted' || booking.status === 'completed',
        ).length;
        const requestCount = bookings.filter((booking) => booking.status === 'pending' || booking.status === 'declined' || booking.status === 'accepted' ).length;
        const taskCount = goals.reduce((total, goal) => {
          const progressItems = goal.UserTaskProgresses ?? goal.UserTaskProgress ?? [];
          const activeTasks = progressItems.filter((item) => !item.isCompleted).length;
          return total + activeTasks;
        }, 0);

        setStats([
          { label: 'Approved', value: approvedCount, color: MERI_COLORS.success },
          { label: 'Requests', value: requestCount, color: MERI_COLORS.accent },
          { label: 'Tasks', value: taskCount, color: '#F59E0B' },
        ]);
      } catch (err) {
        if (isActive) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load profile.');
          setStats(DEFAULT_STATS);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const updateField = (key: keyof ProfileForm, value: string) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
  };

  const pickProfileImage = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      setErrorMessage('Photo access is required to update your profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.uri) {
      setErrorMessage('Unable to read the selected image.');
      return;
    }

    const fileName = asset.fileName ?? `profile-${Date.now()}.jpg`;
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setPendingImage({
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    });
  };

  const handleSave = async (payload: ProfileUpdatePayload) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const user = await updateProfile(pendingImage ? { ...payload, profileImage: pendingImage } : payload);
      const normalized: ProfileForm = {
        name: user.name ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
        businessName: user.businessName ?? '',
        businessCity: user.businessCity ?? '',
        businessSubCity: user.businessSubCity ?? '',
        businessWereda: user.businessWereda ?? '',
        businessKebele: user.businessKebele ?? '',
        businessType: user.businessType ?? '',
        businessArea: user.businessArea ?? '',
        tin: user.tin ?? '',
        profileImage: user.profileImage ?? null,
      };

      setProfile(normalized);
      setInitialProfile(normalized);
      setPendingImage(null);
      setSuccessMessage('Profile updated successfully.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePersonal = () =>
    handleSave({
      name: profile.name,
      phone: profile.phone,
    });

  const handleSaveBusiness = () =>
    handleSave({
      businessName: profile.businessName,
      businessCity: profile.businessCity,
      businessSubCity: profile.businessSubCity,
      businessWereda: profile.businessWereda,
      businessKebele: profile.businessKebele,
      businessType: profile.businessType,
      businessArea: profile.businessArea,
      tin: profile.tin,
    });

  const handleReset = () => {
    setProfile(initialProfile);
    setPendingImage(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleClearPassword = () => {
    setCurrentPassword('');
    setNextPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleChangePassword = async () => {
    if (isChangingPassword) {
      return;
    }

    if (!currentPassword.trim() || !nextPassword.trim()) {
      setErrorMessage('Please enter both your current and new password.');
      return;
    }

    setIsChangingPassword(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await changePassword({
        oldPassword: currentPassword,
        newPassword: nextPassword,
      });
      setSuccessMessage(response.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNextPassword('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to log out.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const displayName = profile.name || 'Your name';
  const displayEmail = profile.email || 'your@email.com';
  const displayPhone = profile.phone || 'Add your phone number';
  const businessAddress = [
    profile.businessCity,
    profile.businessSubCity,
    profile.businessWereda,
    profile.businessKebele,
  ]
    .filter(Boolean)
    .join(', ');
  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const avatarUri = pendingImage?.uri ?? profile.profileImage ?? null;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={MERI_COLORS.accent} />
        <Text style={styles.stateText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroCircleLarge} />
        <View style={styles.heroCircleSmall} />
      </View>

      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials || 'U'}</Text>
              )}
            </View>
            <Pressable style={styles.cameraButton} onPress={pickProfileImage} disabled={isSaving}>
              <Text style={styles.cameraText}>+</Text>
            </Pressable>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.nameText}>{displayName}</Text>
            <Text style={styles.mutedText}>{displayEmail}</Text>
            {businessAddress ? (
              <Text style={styles.mutedText}>{businessAddress}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.detailList}>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Name: </Text>
            {displayName}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Phone: </Text>
            {displayPhone}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Email: </Text>
            {displayEmail}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Business Name: </Text>
            {profile.businessName || 'Add your business name'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Business Address: </Text>
            {businessAddress || 'Add your business address'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Business Type: </Text>
            {profile.businessType || 'Add your business type'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Business Area: </Text>
            {profile.businessArea || 'Add your business area'}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>TIN: </Text>
            {profile.tin || 'Add your TIN'}
          </Text>
        </View>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

      <View style={styles.tabsList}>
        {(
          [
            { key: 'personal', label: 'Personal' },
            { key: 'business', label: 'Business' },
            { key: 'security', label: 'Security' },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'personal' ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionSubtitle}>
            Update your contact details so consultants can reach you.
          </Text>

          <Field
            label="Full Name"
            placeholder="Jane Doe"
            value={profile.name}
            onChangeText={(value) => updateField('name', value)}
          />
          <Field
            label="Phone"
            placeholder="+251 900 000 000"
            value={profile.phone}
            onChangeText={(value) => updateField('phone', value)}
            keyboardType="phone-pad"
          />
          <Field
            label="Email"
            placeholder="jane@example.com"
            value={profile.email}
            keyboardType="email-address"
            editable={false}
            hint="Email cannot be changed"
          />

          <View style={styles.actionRow}>
            <Pressable style={[styles.primaryButton, isSaving && styles.buttonDisabled]} onPress={handleSavePersonal} disabled={isSaving}>
              <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={handleReset}>
              <Text style={styles.ghostButtonText}>Reset</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {activeTab === 'business' ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Business Details</Text>
          <Text style={styles.sectionSubtitle}>
            Tell us about your business to get more relevant consultancy.
          </Text>

          <Field
            label="Business Name"
            placeholder="Acme Corp"
            value={profile.businessName}
            onChangeText={(value) => updateField('businessName', value)}
          />
          <Field
            label="Business Type"
            placeholder="Retail"
            value={profile.businessType}
            onChangeText={(value) => updateField('businessType', value)}
          />
          <Field
            label="Business Area"
            placeholder="Marketing"
            value={profile.businessArea}
            onChangeText={(value) => updateField('businessArea', value)}
          />
          <Field
            label="TIN"
            placeholder="1234567890"
            value={profile.tin}
            onChangeText={(value) => updateField('tin', value)}
          />

          <Text style={styles.subsectionTitle}>Business Address</Text>
          <Field
            label="City"
            placeholder="Addis Ababa"
            value={profile.businessCity}
            onChangeText={(value) => updateField('businessCity', value)}
          />
          <Field
            label="Sub-city"
            placeholder="Bole"
            value={profile.businessSubCity}
            onChangeText={(value) => updateField('businessSubCity', value)}
          />
          <Field
            label="Wereda"
            placeholder="04"
            value={profile.businessWereda}
            onChangeText={(value) => updateField('businessWereda', value)}
          />
          <Field
            label="Kebele"
            placeholder="12"
            value={profile.businessKebele}
            onChangeText={(value) => updateField('businessKebele', value)}
          />

          <View style={styles.actionRow}>
            <Pressable style={[styles.primaryButton, isSaving && styles.buttonDisabled]} onPress={handleSaveBusiness} disabled={isSaving}>
              <Text style={styles.primaryButtonText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={handleReset}>
              <Text style={styles.ghostButtonText}>Reset</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {activeTab === 'security' ? (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <Text style={styles.sectionSubtitle}>
            Use a strong password you do not use anywhere else.
          </Text>

          <Field
            label="Current Password"
            placeholder="Enter current password"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <Field
            label="New Password"
            placeholder="Enter new password"
            secureTextEntry
            value={nextPassword}
            onChangeText={setNextPassword}
          />

          <View style={styles.actionRow}>
            <Pressable
              style={[styles.primaryButton, isChangingPassword && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={isChangingPassword}
            >
              <Text style={styles.primaryButtonText}>
                {isChangingPassword ? 'Updating...' : 'Update Password'}
              </Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={handleClearPassword}>
              <Text style={styles.ghostButtonText}>Clear</Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.logoutButton, isLoggingOut && styles.buttonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Text style={styles.logoutText}>{isLoggingOut ? 'Signing out...' : 'Sign out'}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

type FieldProps = {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  editable?: boolean;
  hint?: string;
};

const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  editable = true,
  hint,
}: FieldProps) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.inputDisabled]}
      placeholder={placeholder}
      placeholderTextColor={MERI_COLORS.mutedText}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      editable={editable}
    />
    {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MERI_COLORS.background,
    gap: 8,
  },
  stateText: {
    color: MERI_COLORS.mutedText,
    fontWeight: '600',
  },
  hero: {
    height: 170,
    backgroundColor: MERI_COLORS.accent,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroCircleLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    top: -60,
    left: -30,
  },
  heroCircleSmall: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    bottom: -40,
    right: -20,
  },
  headerCard: {
    marginTop: -60,
    backgroundColor: MERI_COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    marginRight: 16,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(37, 99, 235, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.25)',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarText: {
    color: MERI_COLORS.accent,
    fontSize: 24,
    fontWeight: '700',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MERI_COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: MERI_COLORS.card,
  },
  cameraText: {
    color: MERI_COLORS.background,
    fontSize: 18,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  nameText: {
    color: MERI_COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  mutedText: {
    color: MERI_COLORS.mutedText,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: MERI_COLORS.background,
    borderRadius: 12,
    paddingVertical: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
    marginTop: 2,
  },
  detailList: {
    borderTopWidth: 1,
    borderTopColor: MERI_COLORS.border,
    paddingTop: 12,
  },
  detailText: {
    color: MERI_COLORS.mutedText,
    marginBottom: 6,
  },
  detailLabel: {
    color: MERI_COLORS.text,
    fontWeight: '700',
  },
  errorText: {
    color: MERI_COLORS.accent,
    fontWeight: '600',
    marginBottom: 12,
  },
  successText: {
    color: MERI_COLORS.success,
    fontWeight: '600',
    marginBottom: 12,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: MERI_COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    padding: 4,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: MERI_COLORS.accent,
  },
  tabText: {
    color: MERI_COLORS.mutedText,
    fontWeight: '600',
  },
  tabTextActive: {
    color: MERI_COLORS.background,
  },
  sectionCard: {
    backgroundColor: MERI_COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: MERI_COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: MERI_COLORS.mutedText,
    marginBottom: 16,
  },
  subsectionTitle: {
    color: MERI_COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: MERI_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  fieldHint: {
    color: MERI_COLORS.mutedText,
    fontSize: 12,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: MERI_COLORS.text,
    backgroundColor: MERI_COLORS.background,
  },
  inputDisabled: {
    backgroundColor: '#F1F5F9',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: MERI_COLORS.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: MERI_COLORS.background,
    fontWeight: '700',
  },
  ghostButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MERI_COLORS.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: MERI_COLORS.text,
    fontWeight: '700',
  },
  logoutButton: {
    marginTop: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MERI_COLORS.danger,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  logoutText: {
    color: MERI_COLORS.danger,
    fontWeight: '700',
  },
});
