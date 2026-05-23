import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable } from 'react-native';

import { MERI_COLORS } from '@/constants/meri';

export function TopMenuButton() {
  const openMenu = () => {
    Alert.alert('More', 'Open page', [
      { text: 'History', onPress: () => router.push('/(tabs)/history') },
      { text: 'Notifications', onPress: () => router.push('/(tabs)/notifications') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Pressable onPress={openMenu} style={{ paddingHorizontal: 6, paddingVertical: 4 }}>
      <Ionicons name="ellipsis-vertical" size={20} color={MERI_COLORS.text} />
    </Pressable>
  );
}
