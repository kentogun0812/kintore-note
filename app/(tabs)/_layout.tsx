import { Tabs, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { Icon, IconName } from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth.store';

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return <Icon name={name} size={24} color={color} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const { isGuest } = useAuthStore();
  const router = useRouter();

  const guestGuard = (e: any) => {
    if (isGuest) {
      e.preventDefault();
      router.push('/auth/login');
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: { 
          backgroundColor: colors.dark.bg.primary, 
          borderTopColor: colors.dark.border.subtle,
          height: Platform.OS === 'ios' ? 68 : 52,
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
        name="record"
        options={{
          title: t('tabs.record'),
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
        name="circle"
        options={{
          title: t('tabs.circle'),
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} />,
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
    </Tabs>
  );
}

