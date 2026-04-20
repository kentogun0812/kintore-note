import { Tabs } from 'expo-router';
import { colors } from '@/constants/colors';
import { Icon, IconName } from '@/components/Icon';

function TabIcon({ name, color, focused }: { name: IconName; color: string; focused: boolean }) {
  return <Icon name={name} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark.bg.primary },
        headerTintColor: colors.dark.text.primary,
        tabBarStyle: { backgroundColor: colors.dark.bg.primary, borderTopColor: colors.dark.border.subtle },
        tabBarActiveTintColor: colors.dark.accent.primary,
        tabBarInactiveTintColor: colors.dark.text.secondary,
        sceneStyle: { backgroundColor: colors.dark.bg.primary },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '記録',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'barbell' : 'barbell-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: 'ボディ',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'body' : 'body-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="circle"
        options={{
          title: 'サークル',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '分析',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
