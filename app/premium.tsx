import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';

export default function PremiumScreen() {
  const features = [
    { icon: 'infinite', title: 'Unlimited Workouts', description: 'Log as many sessions as you lift.' },
    { icon: 'stats-chart', title: 'Advanced Analytics', description: 'Deep dive into your progress curves.' },
    { icon: 'cloud-upload', title: 'Cloud Sync', description: 'Keep your data safe across devices.' },
    { icon: 'star', title: 'Exclusive Programs', description: 'Access to professional training plans.' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingVertical: spacing.sm }}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={12}
          style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 20, 
            borderWidth: 1, 
            borderColor: colors.dark.border.default, 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}
        >
          <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xxl }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.dark.accent.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.dark.accent.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 }}>
            <Icon name="diamond" size={40} color="white" />
          </View>
          <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize['3xl'], fontWeight: 'heavy', textAlign: 'center' }}>
            Kintore Note PRO
          </Text>
          <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.base, textAlign: 'center' }}>
            Take your training to the ultimate level with professional tools.
          </Text>
        </View>

        {/* Features */}
        <View style={{ gap: spacing.lg }}>
          {features.map((f) => (
            <View key={f.title} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.dark.bg.secondary, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name={f.icon as any} size={24} color={colors.dark.accent.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.base, fontWeight: 'bold' }}>{f.title}</Text>
                <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>{f.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans */}
        <View style={{ gap: spacing.md }}>
          <Pressable 
            style={{ 
              padding: spacing.lg, 
              backgroundColor: colors.dark.bg.secondary, 
              borderRadius: radius.lg, 
              borderWidth: 2, 
              borderColor: colors.dark.accent.primary, 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <View>
              <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.lg, fontWeight: 'bold' }}>Annual Plan</Text>
              <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>$49.99 / year</Text>
            </View>
            <View style={{ backgroundColor: colors.dark.accent.primary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm }}>
               <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>SAVE 50%</Text>
            </View>
          </Pressable>

          <Button label="Start 7-Day Free Trial" fullWidth variant="primary" />
          <Text style={{ color: colors.dark.text.tertiary, textAlign: 'center', fontSize: typography.fontSize.xs }}>
            Cancel anytime. Terms of Use & Privacy Policy apply.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
