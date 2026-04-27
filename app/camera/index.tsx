import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { generatePhotoKey } from '@/lib/key-manager';
import { encryptAndSavePhoto } from '@/lib/photo-encryption';

type ShootingAngle = 'front' | 'side' | 'back';
type TimerDuration = 0 | 3 | 5 | 10;

const ANGLE_LABELS: Record<ShootingAngle, { label: string; icon: string }> = {
  front: { label: 'Front', icon: 'person-outline' },
  side: { label: 'Side', icon: 'body-outline' },
  back: { label: 'Back', icon: 'accessibility-outline' },
};

const TIMER_OPTIONS: TimerDuration[] = [0, 3, 5, 10];

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('front');
  const [angle, setAngle] = useState<ShootingAngle>('front');
  const [timerDuration, setTimerDuration] = useState<TimerDuration>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [flashFeedback, setFlashFeedback] = useState(false);
  
  // Animation values
  const captureScale = useSharedValue(1);
  const flashOpacity = useSharedValue(0);

  const captureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      capturePhoto();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.permissionContent}>
          <Icon name="camera" size={64} color={colors.dark.accent.primary} />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Your photos are encrypted locally using AES-256 and never saved to your Camera Roll.
          </Text>
          <Button label="Grant Permission" onPress={requestPermission} fullWidth />
        </View>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleCapturePress() {
    if (isSaving || countdown !== null) return;

    captureScale.value = withSequence(
      withTiming(0.85, { duration: 100 }),
      withSpring(1, { damping: 15 })
    );

    if (timerDuration > 0) {
      setCountdown(timerDuration);
    } else {
      capturePhoto();
    }
  }

  async function capturePhoto() {
    if (!cameraRef.current || isSaving) return;
    
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // 1. Capture photo
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
        exif: false, // Don't store EXIF for privacy
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      // Flash feedback animation
      setFlashFeedback(true);
      setTimeout(() => setFlashFeedback(false), 300);

      // 2. Generate unique ID for this photo
      const photoId = Crypto.randomUUID();

      // 3. Generate and store encryption key
      const key = await generatePhotoKey(photoId);

      // 4. Encrypt and save to App Sandbox (NOT Camera Roll)
      const filePath = await encryptAndSavePhoto(photo.base64, photoId, key);

      // 5. Save metadata to WatermelonDB
      // TODO: Wire up WatermelonDB write when running in EAS Build
      console.log('Photo encrypted and saved:', {
        photoId,
        filePath,
        angle,
        timestamp: Date.now(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back to Body tab after short delay
      setTimeout(() => {
        router.back();
      }, 500);

    } catch (error) {
      console.error('Failed to capture/encrypt photo:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Flash feedback overlay */}
        {flashFeedback && (
          <Animated.View 
            entering={FadeIn.duration(50)} 
            exiting={FadeOut.duration(250)}
            style={styles.flashOverlay} 
          />
        )}

        {/* Countdown overlay */}
        {countdown !== null && countdown > 0 && (
          <View style={styles.countdownOverlay}>
            <Animated.Text 
              entering={ZoomIn.duration(300)}
              key={countdown}
              style={styles.countdownText}
            >
              {countdown}
            </Animated.Text>
          </View>
        )}

        <View style={styles.overlay}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <Pressable 
              style={styles.closeButton} 
              onPress={() => router.back()}
              hitSlop={12}
            >
              <Icon name="close" size={24} color={colors.white} />
            </Pressable>

            {/* Timer Selector */}
            <View style={styles.timerSelector}>
              {TIMER_OPTIONS.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => {
                    setTimerDuration(t);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.timerOption,
                    timerDuration === t && styles.timerOptionActive,
                  ]}
                >
                  {t === 0 ? (
                    <Icon name="timer-outline" size={16} color={timerDuration === t ? colors.dark.accent.warning : colors.white} />
                  ) : (
                    <Text style={[
                      styles.timerOptionText,
                      timerDuration === t && styles.timerOptionTextActive,
                    ]}>
                      {t}s
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* Angle Selector */}
          <View style={styles.angleSelectorContainer}>
            <View style={styles.angleSelector}>
              {(Object.entries(ANGLE_LABELS) as [ShootingAngle, typeof ANGLE_LABELS[ShootingAngle]][]).map(([key, val]) => (
                <Pressable
                  key={key}
                  onPress={() => {
                    setAngle(key);
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.angleOption,
                    angle === key && styles.angleOptionActive,
                  ]}
                >
                  <Icon 
                    name={val.icon as any} 
                    size={16} 
                    color={angle === key ? colors.dark.accent.primary : colors.white} 
                  />
                  <Text style={[
                    styles.angleOptionText,
                    angle === key && styles.angleOptionTextActive,
                  ]}>
                    {val.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Flip Camera */}
            <Pressable style={styles.sideButton} onPress={toggleCameraFacing}>
              <Icon name="camera-reverse" size={24} color={colors.white} />
            </Pressable>

            {/* Capture Button */}
            <Pressable 
              onPress={handleCapturePress} 
              disabled={isSaving}
              style={{ opacity: isSaving ? 0.5 : 1 }}
            >
              <Animated.View style={[styles.captureButton, captureAnimatedStyle]}>
                <View style={[
                  styles.captureInner,
                  countdown !== null && styles.captureInnerActive,
                ]} />
              </Animated.View>
            </Pressable>

            {/* Encryption Badge */}
            <View style={styles.sideButton}>
              <Icon name="lock-closed" size={20} color={colors.dark.accent.success} />
              <Text style={styles.encryptedLabel}>AES</Text>
            </View>
          </View>

          {/* Saving indicator */}
          {isSaving && (
            <Animated.View entering={FadeIn} style={styles.savingOverlay}>
              <Icon name="shield-checkmark" size={32} color={colors.dark.accent.success} />
              <Text style={styles.savingText}>Encrypting...</Text>
            </Animated.View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  // Permission screen
  permissionContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
    alignItems: 'center',
  },
  permissionTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permissionText: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    fontSize: typography.fontSize.base,
    lineHeight: 22,
  },
  // Camera
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  // Flash
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    zIndex: 100,
  },
  // Countdown
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  countdownText: {
    fontSize: typography.fontSize.hero,
    fontWeight: 'bold',
    color: colors.white,
  },
  // Top Bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.alpha.black50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Timer
  timerSelector: {
    flexDirection: 'row',
    backgroundColor: colors.dark.alpha.black50,
    borderRadius: radius.full,
    padding: 3,
    gap: 2,
  },
  timerOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerOptionActive: {
    backgroundColor: colors.dark.alpha.white50,
  },
  timerOptionText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  timerOptionTextActive: {
    color: colors.dark.accent.warning,
  },
  // Angle Selector
  angleSelectorContainer: {
    alignItems: 'center',
  },
  angleSelector: {
    flexDirection: 'row',
    backgroundColor: colors.dark.alpha.black60,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  angleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  angleOptionActive: {
    backgroundColor: colors.dark.alpha.white50,
  },
  angleOptionText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  angleOptionTextActive: {
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
  },
  // Bottom Controls
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 60,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dark.alpha.black50,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  encryptedLabel: {
    color: colors.dark.accent.success,
    fontSize: 9,
    fontWeight: 'bold',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    padding: 4,
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  captureInner: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.black,
  },
  captureInnerActive: {
    borderColor: colors.dark.accent.primary,
    backgroundColor: colors.dark.alpha.accent20,
  },
  // Saving
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 200,
  },
  savingText: {
    color: colors.dark.accent.success,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
});
