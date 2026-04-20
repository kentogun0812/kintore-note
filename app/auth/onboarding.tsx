import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Image } from 'expo-image';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.dark.bg.primary }}>
      <Stack.Screen options={{ title: 'Welcome', headerShown: false }} />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, paddingTop: 100 }}
      >
        <Image 
          source={{ uri: 'sf:figure.strengthtraining.traditional' }} 
          style={{ width: 64, height: 64, tintColor: colors.dark.accent.primary, alignSelf: 'center', marginBottom: spacing.lg }} 
        />
        
        {step === 1 && (
          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize['2xl'], fontWeight: 'bold', textAlign: 'center' }}>
              Welcome to Kintore Note
            </Text>
            <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.md, textAlign: 'center', lineHeight: typography.lineHeight.relaxed }}>
              Your digital training notebook with Hanko stamp culture. Let's get to know your fitness level.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.xl, fontWeight: 'bold', textAlign: 'center' }}>
              What is your current level?
            </Text>
            <Card style={{ padding: spacing.md }}>
              <Text style={{ color: colors.dark.text.primary, fontWeight: 'bold' }}>Beginner</Text>
              <Text style={{ color: colors.dark.text.secondary }}>Just starting out</Text>
            </Card>
            <Card style={{ padding: spacing.md }}>
              <Text style={{ color: colors.dark.text.primary, fontWeight: 'bold' }}>Intermediate</Text>
              <Text style={{ color: colors.dark.text.secondary }}>Training 2-3 times a week</Text>
            </Card>
            <Card style={{ padding: spacing.md, borderColor: colors.dark.accent.primary }}>
              <Text style={{ color: colors.dark.text.primary, fontWeight: 'bold' }}>Advanced</Text>
              <Text style={{ color: colors.dark.text.secondary }}>Experienced lifter</Text>
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: spacing.xl, paddingBottom: spacing.xl, backgroundColor: colors.dark.bg.primary, borderTopWidth: 1, borderTopColor: colors.dark.border.subtle }}>
        <Button 
          label={step === 1 ? 'Continue' : 'Start Training'} 
          size="lg"
          fullWidth
          onPress={() => {
            if (step === 1) setStep(2);
            else {
              router.replace('/(tabs)/home');
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}
