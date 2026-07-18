import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { Icon, IconName } from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';

function TabIcon({ name, color }: { name: IconName; color: string; focused: boolean }) {
  return <Icon name={name} size={24} color={color} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { isGuest } = useAuthStore();
  const router = useRouter();

  const guestGuard = (e: any) => {
    // MOCK: Temporarily bypassed to allow access without login
    // if (isGuest) {
    //   e.preventDefault();
    //   router.push('/auth/login');
    // }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { 
          backgroundColor: colors.dark.bg.primary, 
          borderTopColor: colors.dark.border.subtle,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarActiveTintColor: colors.dark.accent.primary,
        tabBarInactiveTintColor: colors.dark.text.secondary,
        sceneStyle: { backgroundColor: colors.dark.bg.primary },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="training"
        options={{
          title: t('tabs.training'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'barbell' : 'barbell-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: t('tabs.body'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'body' : 'body-outline'} color={color} focused={focused} />,
        }}
        listeners={{ tabPress: guestGuard }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t('tabs.stats'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} focused={focused} />,
        }}
        listeners={{ tabPress: guestGuard }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings', 'Settings'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'settings' : 'settings-outline'} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

