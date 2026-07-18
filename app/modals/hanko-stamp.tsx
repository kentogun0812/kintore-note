import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useTrainingStore } from '@/store/training.store';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  withSequence,
  withDelay, 
  runOnJS,
  Easing
} from 'react-native-reanimated';

export default function HankoStampModal() {
  const { t } = useTranslation();
  const { latestStreak } = useTrainingStore();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const streakOpacity = useSharedValue(0);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    scale.value = withSequence(
      withTiming(1.2, { duration: 200, easing: Easing.out(Easing.cubic) }, () => {
        runOnJS(triggerHaptic)();
      }),
      withSpring(1.0, { damping: 10, stiffness: 150 })
    );
    streakOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
  }, []);

  const animatedStampStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: '-10deg' }
      ],
    };
  });

  const animatedStreakStyle = useAnimatedStyle(() => {
    return {
      opacity: streakOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ presentation: 'fullScreenModal', headerShown: false }} />
      <View style={styles.content}>
        <View style={styles.hankoHitbox}>
          <Animated.View style={[styles.hankoContainer, animatedStampStyle]}>
            <View style={styles.hankoBorder}>
              <Text style={styles.hankoText}>済</Text>
            </View>
          </Animated.View>
        </View>
        <Animated.View style={animatedStreakStyle}>
          <Text style={styles.streakText}>
            🔥 {t('hanko.streak', { count: latestStreak || 1 })}
          </Text>
        </Animated.View>
      </View>
      <View style={styles.footer}>
        <Button 
          label={t('common.close')} 
          fullWidth
          onPress={() => {
            router.navigate('/(tabs)/home');
          }}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: 80,
  },
  streakText: {
    color: colors.dark.accent.warning,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: spacing['4xl'],
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  hankoHitbox: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  hankoContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    borderColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  hankoBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hankoText: {
    color: colors.dark.accent.primary,
    fontSize: 56,
    fontWeight: 'bold',
    opacity: 0.9,
  }
});
