import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  FadeIn, FadeOut, SlideInDown, SlideOutDown,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from './Icon';
import { useTranslation } from 'react-i18next';

interface WelcomePopupProps {
  visible: boolean;
  onDismiss: () => void;
}

export function WelcomePopup({ visible, onDismiss }: WelcomePopupProps) {
  const { t } = useTranslation();
  const confettiScale = useSharedValue(1);
  
  useEffect(() => {
    if (visible) {
      confettiScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        3,
        true
      );
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.overlay}>
      <Pressable style={styles.overlayTouch} onPress={onDismiss} />
      <Animated.View entering={SlideInDown.springify().damping(15)} exiting={SlideOutDown} style={styles.popup}>
        <Animated.View style={[styles.emojiContainer, pulseStyle]}>
          <Text style={styles.emoji}>🎉</Text>
        </Animated.View>
        
        <Text style={styles.title}>{t('welcome.title')}</Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
        
        <Pressable 
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.8 : 1 }]} 
          onPress={onDismiss}
        >
          <Icon name="barbell" size={18} color={colors.white} />
          <Text style={styles.buttonText}>{t('welcome.button')}</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayTouch: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.dark.alpha.black70,
  },
  popup: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    marginHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    // Subtle glow effect
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dark.alpha.accent15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.dark.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.dark.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.white,
  },
});
