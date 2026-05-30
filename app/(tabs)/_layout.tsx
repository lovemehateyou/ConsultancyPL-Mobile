import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';

import { TopMenuButton } from '@/components/top-menu-button';
import { MERI_COLORS } from '@/constants/meri';
import { fetchProfile } from '@/services/profile';

export default function TabLayout() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadRole = async () => {
      try {
        const profile = await fetchProfile();
        if (isActive) {
          setRole(profile.role ?? null);
        }
      } catch {
        if (isActive) {
          setRole(null);
        }
      }
    };

    loadRole();

    return () => {
      isActive = false;
    };
  }, []);

  const canShowChat = role === 'user';

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
      {canShowChat ? (
        <Tabs.Screen
          name="chat"
          options={{
            title: 'AI Chat',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles" color={color} size={size} />
            ),
          }}
        />
      ) : (
        <Tabs.Screen name="chat" options={{ href: null }} />
      )}
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
      <Tabs.Screen name="goal/[id]" options={{ href: null, title: 'Goal Details' }} />
      <Tabs.Screen name="task/[id]" options={{ href: null, title: 'Task Details' }} />
      <Tabs.Screen name="article/[id]" options={{ href: null, title: 'Article' }} />
      <Tabs.Screen name="consultant/[id]" options={{ href: null, title: 'Consultant Details' }} />
    </Tabs>
  );
}
