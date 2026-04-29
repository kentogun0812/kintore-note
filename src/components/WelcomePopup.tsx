import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  FadeIn, FadeOut, FadeInDown, FadeOutDown,
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from './Icon';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/store/auth.store';
import { useOnboardingStore } from '@/store/onboarding.store';

let guestWarningShownThisSession = false;

export function WelcomePopup() {
  const { t } = useTranslation();
  const { isGuest } = useAuthStore();
  const { showWelcome, dismissWelcome } = useOnboardingStore();
  const [showGuestWarning, setShowGuestWarning] = useState(false);

  useEffect(() => {
    if (isGuest && !showWelcome && !guestWarningShownThisSession) {
      setShowGuestWarning(true);
      guestWarningShownThisSession = true;
    }
  }, [isGuest, showWelcome]);

  const visible = showWelcome || showGuestWarning;
  const isWarning = !showWelcome && showGuestWarning;
  const title = isWarning ? t('home.guestWelcome') : t('welcome.title');
  const subtitle = isWarning ? t('home.guestWarning') : t('welcome.subtitle');
  const autoDismiss = !isWarning;

  const onDismiss = () => {
    if (showWelcome) {
      dismissWelcome();
    } else if (showGuestWarning) {
      setShowGuestWarning(false);
    }
  };
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
      if (autoDismiss) {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.overlay}>
      <Pressable style={styles.overlayTouch} onPress={onDismiss} />
      <Animated.View entering={FadeInDown.duration(300)} exiting={FadeOutDown.duration(200)} style={styles.popup}>
        <Animated.View style={[styles.emojiContainer, !isWarning && pulseStyle, isWarning && { backgroundColor: colors.dark.alpha.accent15 }]}>
          <Text style={styles.emoji}>{isWarning ? '⚠️' : '🎉'}</Text>
        </Animated.View>
        
        <Text style={styles.title}>{title || t('welcome.title')}</Text>
        <Text style={styles.subtitle}>{subtitle || t('welcome.subtitle')}</Text>
        
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
    padding: spacing.xl,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.dark.alpha.accent15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.dark.accent.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  buttonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.white,
  },
});
