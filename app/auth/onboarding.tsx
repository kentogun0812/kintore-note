import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import { useOnboardingStore } from '@/store/onboarding.store';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeOutLeft, 
  Layout, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue,
  withDelay
} from 'react-native-reanimated';

const GymIllustration = () => {
  const lift = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    lift.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 1000 }),
        withTiming(0, { duration: 800 })
      ),
      -1,
      true
    );
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const barbellStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.3,
  }));

  return (
    <View style={styles.illustrationContainer}>
      <Animated.View style={[styles.pulseCircle, bgStyle]} />
      <View style={styles.iconCircle}>
        <Animated.View style={barbellStyle}>
          <Icon name="barbell" size={80} color={colors.dark.accent.primary} />
        </Animated.View>
      </View>
      
      {/* Decorative Particles */}
      {[0, 1, 2].map((i) => (
        <FloatingParticle key={i} index={i} />
      ))}
    </View>
  );
};

const FloatingParticle = ({ index }: { index: number }) => {
  const move = useSharedValue(0);
  
  React.useEffect(() => {
    move.value = withDelay(
      index * 400,
      withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - move.value,
    transform: [
      { translateY: -100 * move.value },
      { translateX: Math.sin(index * 2) * 20 },
      { scale: 0.5 + move.value * 0.5 }
    ],
  }));

  return (
    <Animated.View 
      style={[
        styles.particle, 
        { left: 60 + index * 40, top: 100 },
        style
      ]} 
    >
      <Icon name="flash" size={16} color={colors.dark.accent.warning} />
    </Animated.View>
  );
};

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { complete } = useOnboardingStore();
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    if (step === 1) {
      setStep(2);
    } else {
      if (selectedLevel) {
        complete();
        router.replace('/(tabs)/home');
      }
    }
  }, [step, selectedLevel, complete]);

  const levels = [
    { id: 'beginner', icon: 'egg-outline', color: colors.dark.accent.success },
    { id: 'intermediate', icon: 'flame-outline', color: colors.dark.accent.warning },
    { id: 'advanced', icon: 'trophy-outline', color: colors.dark.accent.primary },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        <Animated.View layout={Layout.springify()} style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: step === 1 ? '50%' : '100%' }]} />
        </Animated.View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 ? (
            <Animated.View 
              key="step1"
              entering={FadeInRight.duration(400).springify()}
              exiting={FadeOutLeft}
              style={styles.stepWrapper}
            >
              <GymIllustration />
              <Animated.View 
                entering={FadeInDown.delay(300).springify()}
                style={styles.textContainer}
              >
                <Text style={styles.title}>{t('onboarding.step1.title')}</Text>
                <Text style={styles.subtitle}>{t('onboarding.step1.subtitle')}</Text>
              </Animated.View>
            </Animated.View>
          ) : (
            <Animated.View 
              key="step2"
              entering={FadeInRight.duration(400).springify()}
              style={styles.stepWrapper}
            >
              <Animated.View 
                entering={FadeInDown.delay(300).springify()}
                style={styles.textContainer}
              >
                <Text style={styles.title}>{t('onboarding.step2.title')}</Text>
                <Text style={styles.subtitle}>{t('onboarding.step2.subtitle')}</Text>
              </Animated.View>

              <View style={styles.levelsGrid}>
                {levels.map((level, index) => (
                  <Animated.View 
                    key={level.id}
                    entering={FadeInDown.delay(200 + index * 100).springify()}
                  >
                    <Pressable
                      onPress={() => setSelectedLevel(level.id)}
                      style={[
                        styles.levelCard,
                        selectedLevel === level.id && styles.levelCardSelected
                      ]}
                    >
                      <View style={[styles.levelIconContainer, { backgroundColor: level.color + '20' }]}>
                        <Icon name={level.icon as any} size={28} color={level.color} />
                      </View>
                      <View style={styles.levelTextContainer}>
                        <Text style={styles.levelTitle}>{t(`onboarding.levels.${level.id}.title`)}</Text>
                        <Text style={styles.levelDesc}>{t(`onboarding.levels.${level.id}.desc`)}</Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button 
            label={step === 1 ? t('onboarding.step1.button') : t('onboarding.step2.button')} 
            size="lg"
            fullWidth
            onPress={handleNext}
            disabled={step === 2 && !selectedLevel}
            variant={step === 2 && !selectedLevel ? 'secondary' : 'primary'}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.dark.bg.tertiary,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.dark.accent.primary,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  stepWrapper: {
    gap: spacing.xxl,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.dark.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.dark.accent.primary + '40',
    zIndex: 2,
  },
  pulseCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.dark.accent.primary,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    zIndex: 3,
  },
  hankoStampText: {
    color: colors.dark.accent.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  textContainer: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: -spacing.lg,
  },
  title: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize['2xl'],
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
    paddingHorizontal: spacing.sm,
  },
  subtitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: spacing.md,
    letterSpacing: 0.2,
  },
  levelsGrid: {
    width: '100%',
    gap: spacing.md,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  levelCardSelected: {
    borderColor: colors.dark.accent.primary,
    backgroundColor: colors.dark.bg.elevated,
  },
  levelIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelTextContainer: {
    flex: 1,
  },
  levelTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  levelDesc: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.primary,
  },
});


