import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon, IconName } from '@/components/Icon';
import { Card } from '@/components/Card';
import { useAuthStore } from '@/store/auth.store';

export default function SettingsScreen() {
  const signOut = useAuthStore((s) => s.signOut);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('English');

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const menuSections = [
    {
      title: 'Preferences',
      items: [
        { 
          label: 'Language', 
          value: language,
          icon: 'globe-outline', 
          onPress: () => setLanguage(language === 'English' ? 'Tiếng Việt' : 'English') 
        },
        { 
          label: 'Notifications', 
          icon: 'notifications-outline', 
          isToggle: true,
          toggleValue: notificationsEnabled,
          onToggle: setNotificationsEnabled
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        { label: 'Privacy Policy', icon: 'shield-checkmark-outline' },
        { label: 'Terms of Use', icon: 'document-text-outline' },
      ],
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.base, paddingVertical: spacing.sm }}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={12}
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
        <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.xl, fontWeight: 'bold' }}>
          Settings
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.base, gap: spacing.lg }}
      >
        {/* Premium Banner */}
        <Pressable onPress={() => router.push('/premium')}>
          <Card style={{ backgroundColor: colors.dark.accent.primary, borderCurve: 'continuous', overflow: 'hidden' }}>
            <View style={{ padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
               <View style={{ gap: spacing.xs, flex: 1 }}>
                 <Text style={{ color: 'white', fontSize: typography.fontSize.lg, fontWeight: 'heavy' }}>Upgrade to PRO</Text>
                 <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: typography.fontSize.sm }}>Unlock advanced stats & analytics</Text>
               </View>
               <Icon name="diamond" size={40} color="white" />
            </View>
          </Card>
        </Pressable>

        {menuSections.map((section) => (
          <View key={section.title} style={{ gap: spacing.sm }}>
            <Text style={{ color: colors.dark.text.tertiary, fontSize: typography.fontSize.xs, fontWeight: 'bold', textTransform: 'uppercase', paddingHorizontal: spacing.xs }}>
              {section.title}
            </Text>
            <View style={{ backgroundColor: colors.dark.bg.secondary, borderRadius: radius.lg, overflow: 'hidden' }}>
              {section.items.map((item, i) => (
                <Pressable
                  key={item.label}
                  onPress={item.onPress}
                  disabled={item.isToggle} // Disable press if it's a switch item
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
                  <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.dark.bg.tertiary, justifyContent: 'center', alignItems: 'center' }}>
                    <Icon name={item.icon as any} size={18} color={colors.dark.text.secondary} />
                  </View>
                  <Text style={{ flex: 1, color: colors.dark.text.primary, fontSize: typography.fontSize.base }}>{item.label}</Text>
                  
                  {item.isToggle ? (
                    <Switch 
                      value={item.toggleValue} 
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.dark.bg.elevated, true: colors.dark.accent.primary }}
                      thumbColor="white"
                    />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                      {item.value && (
                        <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>{item.value}</Text>
                      )}
                      <Icon name="chevron-forward" size={16} color={colors.dark.text.tertiary} />
                    </View>
                  )}
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
            backgroundColor: pressed ? 'rgba(229, 77, 66, 0.1)' : colors.dark.bg.secondary,
            borderRadius: radius.lg,
            padding: spacing.md,
            marginTop: spacing.md,
            borderWidth: 1,
            borderColor: pressed ? colors.dark.accent.primary : 'transparent',
          })}
        >
          <Icon name="log-out-outline" size={20} color={colors.dark.accent.primary} />
          <Text style={{ color: colors.dark.accent.primary, fontWeight: 'bold', fontSize: typography.fontSize.base }}>
            Sign Out
          </Text>
        </Pressable>

        <Text style={{ color: colors.dark.text.tertiary, fontSize: typography.fontSize.xs, textAlign: 'center', marginTop: spacing.xl }}>
          Kintore Note v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
