import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppStateProvider } from '@/context/app-state';
import { SignupProvider } from '@/context/signup-context';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <SignupProvider>
        <>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="dark" />
        </>
      </SignupProvider>
    </AppStateProvider>
  );
}
