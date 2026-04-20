import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon, IconName } from '@/components/Icon';
import { useAuthStore } from '@/store/auth.store';

export default function SettingsScreen() {
  const signOut = useAuthStore((s) => s.signOut);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const sections: { title: string; items: { label: string; icon: IconName }[] }[] = [
    {
      title: 'Account',
      items: [
        { label: 'Profile', icon: 'person' },
        { label: 'Subscription', icon: 'diamond' },
      ],
    },
    {
      title: 'App',
      items: [
        { label: 'Language', icon: 'globe-outline' },
        { label: 'Notifications', icon: 'notifications' },
      ],
    },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: spacing.base, gap: spacing.lg }}
    >
      <Stack.Screen options={{ 
        title: '設定 (Settings)', 
        headerLargeTitle: true,
        headerLeft: () => (
          <Pressable 
            onPress={() => router.back()} 
            hitSlop={8} 
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 18, 
              borderWidth: 1, 
              borderColor: colors.dark.border.default, 
              justifyContent: 'center', 
              alignItems: 'center'
            }}
          >
            <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
          </Pressable>
        ),
      }} />

      {sections.map((section) => (
        <View key={section.title} style={{ gap: spacing.xs }}>
          <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm, paddingHorizontal: spacing.sm, marginBottom: spacing.xs }}>
            {section.title}
          </Text>
          <View style={{ backgroundColor: colors.dark.bg.secondary, borderRadius: radius.lg, borderCurve: 'continuous', overflow: 'hidden' }}>
            {section.items.map((item, i) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: spacing.md,
                  gap: spacing.md,
                  backgroundColor: pressed ? colors.dark.bg.elevated : 'transparent',
                  borderBottomWidth: i < section.items.length - 1 ? 1 : 0,
                  borderBottomColor: colors.dark.border.subtle,
                })}
              >
                <Icon name={item.icon} size={20} color={colors.dark.text.secondary} />
                <Text style={{ flex: 1, color: colors.dark.text.primary, fontSize: typography.fontSize.base }}>{item.label}</Text>
                <Icon name="chevron-forward" size={16} color={colors.dark.text.tertiary} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <Pressable
        onPress={handleSignOut}
        style={({ pressed }) => ({
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: spacing.sm,
          backgroundColor: pressed ? colors.dark.bg.elevated : colors.dark.bg.secondary,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          padding: spacing.md,
          marginTop: spacing.md,
        })}
      >
        <Icon name="log-out-outline" size={20} color={colors.dark.accent.primary} />
        <Text style={{ color: colors.dark.accent.primary, fontWeight: 'bold', fontSize: typography.fontSize.base }}>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}
