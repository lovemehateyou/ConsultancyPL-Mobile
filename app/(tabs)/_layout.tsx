import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { TopMenuButton } from '@/components/top-menu-button';
import { MERI_COLORS } from '@/constants/meri';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerStyle: { backgroundColor: MERI_COLORS.background },
        headerTitleStyle: { color: MERI_COLORS.text, fontWeight: '700' },
        tabBarStyle: { backgroundColor: MERI_COLORS.background, borderTopColor: MERI_COLORS.border },
        tabBarActiveTintColor: MERI_COLORS.accent,
        tabBarInactiveTintColor: MERI_COLORS.mutedText,
        headerRight: () => <TopMenuButton />,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <Ionicons name="library" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="consultant"
        options={{
          title: 'Consultant',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="history" options={{ href: null, title: 'History' }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notifications' }} />
      <Tabs.Screen name="task/[id]" options={{ href: null, title: 'Task Details' }} />
      <Tabs.Screen name="article/[id]" options={{ href: null, title: 'Article' }} />
      <Tabs.Screen name="consultant/[id]" options={{ href: null, title: 'Consultant Details' }} />
    </Tabs>
  );
}
