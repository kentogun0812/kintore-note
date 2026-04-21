import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Welcome', headerShown: false }} />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <Image 
          source={{ uri: 'sf:figure.strengthtraining.traditional' }} 
          style={styles.heroImage} 
        />
        
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>
              Welcome to Kintore Note
            </Text>
            <Text style={styles.subtitle}>
              Your digital training notebook with Hanko stamp culture. Let's get to know your fitness level.
            </Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.question}>
              What is your current level?
            </Text>
            <Card style={styles.optionCard}>
              <Text style={styles.optionTitle}>Beginner</Text>
              <Text style={styles.optionDescription}>Just starting out</Text>
            </Card>
            <Card style={styles.optionCard}>
              <Text style={styles.optionTitle}>Intermediate</Text>
              <Text style={styles.optionDescription}>Training 2-3 times a week</Text>
            </Card>
            <Card style={[styles.optionCard, styles.optionCardSelected]}>
              <Text style={styles.optionTitle}>Advanced</Text>
              <Text style={styles.optionDescription}>Experienced lifter</Text>
            </Card>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  scrollContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingTop: 100,
  },
  heroImage: {
    width: 64,
    height: 64,
    tintColor: colors.dark.accent.primary,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  stepContainer: {
    gap: spacing.md,
  },
  title: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed,
  },
  question: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionCard: {
    padding: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.dark.accent.primary,
  },
  optionTitle: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
  },
  optionDescription: {
    color: colors.dark.text.secondary,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
  },
});

