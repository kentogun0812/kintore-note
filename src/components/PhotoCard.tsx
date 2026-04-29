import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from './Icon';
import { decryptPhoto } from '@/lib/photo-encryption';
import { getPhotoKey } from '@/lib/key-manager';
import { useTranslation } from 'react-i18next';

type ShootingAngle = 'front' | 'side' | 'back';

interface PhotoCardProps {
  photoId: string;
  filePath: string;
  angle: ShootingAngle;
  takenAt: number;
  onPress?: () => void;
}

const ANGLE_CONFIG: Record<ShootingAngle, { label: string; icon: string; color: string }> = {
  front: { label: 'Front', icon: 'person-outline', color: colors.dark.accent.info },
  side: { label: 'Side', icon: 'body-outline', color: colors.dark.accent.warning },
  back: { label: 'Back', icon: 'accessibility-outline', color: colors.dark.accent.success },
};

export function PhotoCard({ photoId, filePath, angle, takenAt, onPress }: PhotoCardProps) {
  const { t } = useTranslation();
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(true);
  const [hasError, setHasError] = useState(false);

  const angleInfo = ANGLE_CONFIG[angle] || ANGLE_CONFIG.front;
  const dateStr = formatDate(takenAt);
  const timeStr = formatTime(takenAt);

  useEffect(() => {
    let cancelled = false;

    async function loadThumbnail() {
      try {
        setIsDecrypting(true);
        const key = await getPhotoKey(photoId);
        if (!key || cancelled) return;

        const base64 = await decryptPhoto(filePath, key);
        if (!cancelled) {
          setThumbnailUri(`data:image/jpeg;base64,${base64}`);
        }
      } catch (error) {
        console.error('Failed to decrypt photo thumbnail:', error);
        if (!cancelled) setHasError(true);
      } finally {
        if (!cancelled) setIsDecrypting(false);
      }
    }

    loadThumbnail();
    return () => { cancelled = true; };
  }, [photoId, filePath]);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.container,
      { opacity: pressed ? 0.85 : 1 },
    ]}>
      <View style={styles.imageContainer}>
        {isDecrypting ? (
          <View style={styles.placeholder}>
            <Icon name="lock-closed" size={24} color={colors.dark.text.tertiary} />
            <Text style={styles.placeholderText}>{t('body.decrypting')}</Text>
          </View>
        ) : hasError ? (
          <View style={styles.placeholder}>
            <Icon name="alert-circle" size={24} color={colors.dark.accent.warning} />
            <Text style={styles.placeholderText}>{t('common.error')}</Text>
          </View>
        ) : thumbnailUri ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.imageWrapper}>
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.image}
              resizeMode="cover"
              blurRadius={2}
            />
            <View style={styles.blurOverlay}>
              <Icon name="eye-outline" size={20} color={colors.white} />
            </View>
          </Animated.View>
        ) : null}

        <View style={styles.encryptionBadge}>
          <Icon name="shield-checkmark" size={10} color={colors.dark.accent.success} />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={[styles.angleBadge, { backgroundColor: angleInfo.color + '20' }]}>
          <Icon name={angleInfo.icon as any} size={12} color={angleInfo.color} />
          <Text style={[styles.angleBadgeText, { color: angleInfo.color }]}>
            {angleInfo.label}
          </Text>
        </View>

        <Text style={styles.dateText}>{dateStr}</Text>
        <Text style={styles.timeText}>{timeStr}</Text>
      </View>
    </Pressable>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const month = date.toLocaleString('default', { month: 'short' });
  return `${month} ${date.getDate()}`;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  imageContainer: {
    height: 180,
    backgroundColor: colors.dark.bg.tertiary,
    position: 'relative',
  },
  imageWrapper: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.dark.alpha.black50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  placeholderText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
  encryptionBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.dark.alpha.black60,
    borderRadius: radius.full,
    padding: 4,
  },
  infoContainer: {
    padding: spacing.sm,
    gap: 4,
  },
  angleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  angleBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  dateText: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  timeText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
});
