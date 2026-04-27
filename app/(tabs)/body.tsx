import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { PhotoCard } from '@/components/PhotoCard';
import { listEncryptedPhotos } from '@/lib/photo-encryption';
import { useTranslation } from 'react-i18next';

type AngleFilter = 'all' | 'front' | 'side' | 'back';

interface BodyPhotoItem {
  id: string;
  filePath: string;
  angle: 'front' | 'side' | 'back';
  takenAt: number;
}

const ANGLE_FILTERS: { key: AngleFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'grid-outline' },
  { key: 'front', label: 'Front', icon: 'person-outline' },
  { key: 'side', label: 'Side', icon: 'body-outline' },
  { key: 'back', label: 'Back', icon: 'accessibility-outline' },
];

export default function BodyScreen() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<BodyPhotoItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<AngleFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load photos whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [])
  );

  async function loadPhotos() {
    try {
      setIsLoading(true);
      const filePaths = await listEncryptedPhotos();
      
      // Parse photo metadata from file paths
      // In production, this would query WatermelonDB for full metadata
      const photoItems: BodyPhotoItem[] = filePaths.map((fp, index) => {
        const filename = fp.split('/').pop()?.replace('.enc', '') || '';
        return {
          id: filename,
          filePath: fp,
          angle: (['front', 'side', 'back'] as const)[index % 3],
          takenAt: Date.now() - (index * 86400000), // Simulated timestamps
        };
      });

      // Sort by newest first
      photoItems.sort((a, b) => b.takenAt - a.takenAt);
      setPhotos(photoItems);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPhotos = activeFilter === 'all' 
    ? photos 
    : photos.filter(p => p.angle === activeFilter);

  // Group photos by month for timeline
  const groupedPhotos = groupByMonth(filteredPhotos);

  const handleFilterChange = (filter: AngleFilter) => {
    setActiveFilter(filter);
    Haptics.selectionAsync();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Body Records</Text>
          <View style={styles.headerBadge}>
            <Icon name="shield-checkmark" size={14} color={colors.dark.accent.success} />
            <Text style={styles.headerBadgeText}>E2E Encrypted</Text>
          </View>
        </View>

        {/* Camera CTA */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <Card style={styles.cameraCard}>
            <View style={styles.cameraCardContent}>
              <View style={styles.cameraCardInfo}>
                <View style={styles.cameraCardHeader}>
                  <Icon name="camera" size={24} color={colors.dark.accent.primary} />
                  <Text style={styles.cameraCardTitle}>Take Progress Photo</Text>
                </View>
                <Text style={styles.cameraCardDesc}>
                  AES-256 encrypted · Self-timer · Never saved to Camera Roll
                </Text>
              </View>
              <Link href="/camera" asChild>
                <Pressable style={styles.cameraButton}>
                  <Icon name="add" size={28} color={colors.white} />
                </Pressable>
              </Link>
            </View>
          </Card>
        </Animated.View>

        {/* Stats Summary */}
        {photos.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{photos.length}</Text>
                <Text style={styles.statLabel}>Photos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {photos.filter(p => p.angle === 'front').length}
                </Text>
                <Text style={styles.statLabel}>Front</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {photos.filter(p => p.angle === 'side').length}
                </Text>
                <Text style={styles.statLabel}>Side</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {photos.filter(p => p.angle === 'back').length}
                </Text>
                <Text style={styles.statLabel}>Back</Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Angle Filter */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <View style={styles.filterRow}>
            {ANGLE_FILTERS.map((filter) => (
              <Pressable
                key={filter.key}
                onPress={() => handleFilterChange(filter.key)}
                style={[
                  styles.filterChip,
                  activeFilter === filter.key && styles.filterChipActive,
                ]}
              >
                <Icon 
                  name={filter.icon as any} 
                  size={14} 
                  color={activeFilter === filter.key ? colors.dark.accent.primary : colors.dark.text.secondary} 
                />
                <Text style={[
                  styles.filterChipText,
                  activeFilter === filter.key && styles.filterChipTextActive,
                ]}>
                  {filter.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Gallery */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Icon name="lock-closed" size={32} color={colors.dark.text.tertiary} />
            <Text style={styles.loadingText}>Loading encrypted photos...</Text>
          </View>
        ) : filteredPhotos.length === 0 ? (
          <Animated.View entering={FadeIn.delay(400)}>
            <Card style={styles.emptyCard}>
              <Icon name="images-outline" size={56} color={colors.dark.text.tertiary} />
              <Text style={styles.emptyTitle}>
                {photos.length === 0 ? 'No Progress Photos Yet' : 'No Photos for This Angle'}
              </Text>
              <Text style={styles.emptyDesc}>
                {photos.length === 0 
                  ? 'Start tracking your body transformation with encrypted, private photos.'
                  : 'Take a photo from this angle to see your progress here.'
                }
              </Text>
              {photos.length === 0 && (
                <Link href="/camera" asChild>
                  <Button label="Take First Photo" iconName="camera" />
                </Link>
              )}
            </Card>
          </Animated.View>
        ) : (
          /* Timeline grouped by month */
          groupedPhotos.map(({ month, items }, groupIndex) => (
            <Animated.View 
              key={month} 
              entering={FadeInDown.delay(400 + groupIndex * 100)}
              style={styles.monthSection}
            >
              <View style={styles.monthHeader}>
                <View style={styles.monthDot} />
                <Text style={styles.monthTitle}>{month}</Text>
                <Text style={styles.monthCount}>{items.length} photos</Text>
              </View>

              <View style={styles.photoGrid}>
                {items.map((photo) => (
                  <View key={photo.id} style={styles.photoGridItem}>
                    <PhotoCard
                      photoId={photo.id}
                      filePath={photo.filePath}
                      angle={photo.angle}
                      takenAt={photo.takenAt}
                      onPress={() => {
                        // TODO: Open full-screen decrypted view
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    />
                  </View>
                ))}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Group photos by month label for timeline display */
function groupByMonth(photos: BodyPhotoItem[]): { month: string; items: BodyPhotoItem[] }[] {
  const groups = new Map<string, BodyPhotoItem[]>();
  
  for (const photo of photos) {
    const date = new Date(photo.takenAt);
    const monthKey = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
    
    if (!groups.has(monthKey)) {
      groups.set(monthKey, []);
    }
    groups.get(monthKey)!.push(photo);
  }

  return Array.from(groups.entries()).map(([month, items]) => ({ month, items }));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl * 3,
    gap: spacing.md,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.dark.bg.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  headerBadgeText: {
    color: colors.dark.accent.success,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  // Camera CTA
  cameraCard: {
    padding: spacing.md,
    backgroundColor: colors.dark.bg.elevated,
  },
  cameraCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cameraCardInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  cameraCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cameraCardTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  cameraCardDesc: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
    lineHeight: 18,
  },
  cameraButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  statLabel: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.dark.border.default,
    marginVertical: spacing.xs,
  },
  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  filterChipActive: {
    backgroundColor: colors.dark.alpha.accent10,
    borderColor: colors.dark.accent.primary,
  },
  filterChipText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
  },
  // Loading
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  // Empty
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dark.border.default,
  },
  emptyTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyDesc: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  // Month timeline
  monthSection: {
    gap: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  monthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dark.accent.primary,
  },
  monthTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    flex: 1,
  },
  monthCount: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
  // Photo Grid
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoGridItem: {
    width: '48%',
  },
});
