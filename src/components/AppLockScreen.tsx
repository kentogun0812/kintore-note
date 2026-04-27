import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from './Icon';
import { useTranslation } from 'react-i18next';
import { setAuthenticating } from '@/hooks/use-app-lock';

interface AppLockScreenProps {
  onUnlock: () => void;
}

export function AppLockScreen({ onUnlock }: AppLockScreenProps) {
  const { t } = useTranslation();
  const [authType, setAuthType] = useState<'face' | 'fingerprint' | 'unknown'>('unknown');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const isBusy = useRef(false);

  // Animation values
  const lockScale = useSharedValue(1);
  const lockRotation = useSharedValue(0);
  const shimmerOffset = useSharedValue(0);

  const lockAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: lockScale.value },
      { rotate: `${lockRotation.value}deg` },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmerOffset.value * 0.4,
  }));

  // Detect biometric type on mount
  useEffect(() => {
    detectAuthType();
    shimmerOffset.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  // Auto-prompt on mount (only once)
  useEffect(() => {
    const timer = setTimeout(() => {
      runAuthentication();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  async function detectAuthType() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setAuthType('face');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setAuthType('fingerprint');
      }
    } catch {
      setAuthType('unknown');
    }
  }

  /**
   * Core authentication flow.
   * Uses a ref-based guard (isBusy) to prevent concurrent calls.
   * Sets the module-level _isAuthenticating flag to prevent AppState re-locks.
   */
  async function runAuthentication() {
    if (isBusy.current) return;
    isBusy.current = true;

    setHasError(false);
    setErrorMessage('');

    // Tell the AppState listener: "I'm about to open a native prompt, don't re-lock"
    setAuthenticating(true);

    try {
      // Check hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        onUnlock();
        return;
      }

      // Check enrollment
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        onUnlock();
        return;
      }

      // Attempt biometric auth
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('appLock.authPrompt'),
        cancelLabel: t('common.cancel'),
        disableDeviceFallback: false,
        fallbackLabel: t('appLock.usePasscode'),
      });

      if (result.success) {
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Unlock IMMEDIATELY — no setTimeout delay
        // The animation is just visual sugar, it shouldn't block the unlock
        lockScale.value = withSequence(
          withSpring(1.3, { damping: 8 }),
          withTiming(0, { duration: 300 })
        );

        // Unlock the app right away
        onUnlock();
        return;
      } else {
        // Failure
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        lockRotation.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );

        setHasError(true);
        if (result.error === 'user_cancel') {
          setErrorMessage(t('appLock.cancelled'));
        } else {
          setErrorMessage(t('appLock.failed'));
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setHasError(true);
      setErrorMessage(t('appLock.error'));
    } finally {
      isBusy.current = false;
      // Keep _isAuthenticating true for a grace period — 
      // onUnlock() will handle clearing it via the _justUnlocked flag in useAppLock
      setTimeout(() => {
        setAuthenticating(false);
      }, 1000);
    }
  }

  const biometricIcon = authType === 'face' ? 'scan-outline' : 'finger-print-outline';
  const biometricLabel = authType === 'face' ? t('appLock.faceId') : t('appLock.touchId');

  return (
    <Animated.View 
      entering={FadeIn.duration(200)} 
      exiting={FadeOut.duration(200)} 
      style={styles.container}
    >
      {/* Background gradient effect */}
      <Animated.View style={[styles.bgGlow, shimmerStyle]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Lock Icon */}
        <Animated.View style={[styles.lockContainer, lockAnimatedStyle]}>
          <View style={styles.lockCircle}>
            <Icon name="lock-closed" size={40} color={colors.dark.accent.primary} />
          </View>
        </Animated.View>

        {/* App Name */}
        <Text style={styles.appName}>筋トレノート</Text>
        <Text style={styles.subtitle}>{t('appLock.subtitle')}</Text>

        {/* Error Message */}
        {hasError && (
          <Animated.View entering={FadeIn} style={styles.errorContainer}>
            <Icon name="alert-circle" size={16} color={colors.dark.accent.warning} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </Animated.View>
        )}

        {/* Unlock Button */}
        <Pressable
          onPress={runAuthentication}
          style={({ pressed }) => [
            styles.unlockButton,
            { 
              opacity: pressed ? 0.8 : 1, 
              transform: [{ scale: pressed ? 0.97 : 1 }] 
            },
          ]}
        >
          <Icon name={biometricIcon as any} size={24} color={colors.white} />
          <Text style={styles.unlockText}>
            {hasError ? t('appLock.tryAgain') : biometricLabel}
          </Text>
        </Pressable>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Icon name="shield-checkmark" size={14} color={colors.dark.accent.success} />
          <Text style={styles.securityText}>{t('appLock.secured')}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  bgGlow: {
    position: 'absolute',
    top: '30%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.dark.accent.primary,
    opacity: 0.05,
  },
  content: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  lockContainer: {
    marginBottom: spacing.md,
  },
  lockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.dark.alpha.accent10,
    borderWidth: 2,
    borderColor: colors.dark.alpha.accent20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
  },
  errorText: {
    color: colors.dark.accent.warning,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dark.accent.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginTop: spacing.md,
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  unlockText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xl,
    opacity: 0.6,
  },
  securityText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
  },
});
