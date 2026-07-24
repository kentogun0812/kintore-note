import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { DetailedMuscleStat } from '@/store/analytics.store';
import { 
  SvgMuscleKey, 
  getMuscleColor, 
  aggregateMuscleStats, 
  SVG_MUSCLE_NAMES 
} from '@/utils/muscleHeatmap';
import { BodyFrontSvg } from './body-svg/BodyFrontSvg';
import { BodyBackSvg } from './body-svg/BodyBackSvg';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/Icon';

interface MuscleHeatmapProps {
  data: DetailedMuscleStat[];
}

export function MuscleHeatmap({ data }: MuscleHeatmapProps) {
  const { i18n, t } = useTranslation();
  const [viewMode, setViewMode] = useState<'front' | 'back'>('front');
  const [selectedMuscleKey, setSelectedMuscleKey] = useState<SvgMuscleKey | null>(null);

  // Aggregate raw DB stats into SVG muscle stats map
  const { statsMap, maxVolume } = useMemo(() => aggregateMuscleStats(data), [data]);

  const getFillColor = (key: SvgMuscleKey) => {
    const stat = statsMap[key];
    return getMuscleColor(stat ? stat.volume : 0, maxVolume);
  };

  const handleSelectMuscle = (key: SvgMuscleKey) => {
    if (selectedMuscleKey === key) {
      setSelectedMuscleKey(null);
    } else {
      setSelectedMuscleKey(key);
    }
  };

  const selectedStat = selectedMuscleKey ? statsMap[selectedMuscleKey] : null;

  // Format date
  const formatLastActive = (isoStr: string | null) => {
    if (!isoStr) return t('common.noData', 'No sessions recorded');
    const d = new Date(isoStr);
    return d.toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      {/* Front / Back Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, viewMode === 'front' && styles.segmentBtnActive]}
          onPress={() => setViewMode('front')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentText, viewMode === 'front' && styles.segmentTextActive]}>
            {t('stats.heatmapFront', 'Front')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, viewMode === 'back' && styles.segmentBtnActive]}
          onPress={() => setViewMode('back')}
          activeOpacity={0.7}
        >
          <Text style={[styles.segmentText, viewMode === 'back' && styles.segmentTextActive]}>
            {t('stats.heatmapBack', 'Back')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* SVG Canvas Container */}
      <View style={styles.svgWrapper}>
        {viewMode === 'front' ? (
          <BodyFrontSvg
            getFillColor={getFillColor}
            selectedMuscle={selectedMuscleKey}
            onSelectMuscle={handleSelectMuscle}
          />
        ) : (
          <BodyBackSvg
            getFillColor={getFillColor}
            selectedMuscle={selectedMuscleKey}
            onSelectMuscle={handleSelectMuscle}
          />
        )}
      </View>

      {/* Detailed Muscle Stats Popover / Card */}
      {selectedStat ? (
        <View style={styles.statCard}>
          <View style={styles.statHeader}>
            <View style={styles.statHeaderTitleRow}>
              <View style={[styles.activeIndicatorDot, { backgroundColor: getFillColor(selectedStat.key) }]} />
              <Text style={styles.statTitle}>
                {i18n.language === 'ja' ? SVG_MUSCLE_NAMES[selectedStat.key].ja : SVG_MUSCLE_NAMES[selectedStat.key].en}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedMuscleKey(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={18} color={colors.dark.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t('stats.workouts', 'Workouts')}</Text>
              <Text style={styles.statValue}>{selectedStat.workoutCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t('stats.sets', 'Total Sets')}</Text>
              <Text style={styles.statValue}>{selectedStat.setCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{t('stats.volume', 'Volume')}</Text>
              <Text style={styles.statValue}>{Math.round(selectedStat.volume).toLocaleString()} <Text style={styles.unitText}>kg</Text></Text>
            </View>
            <View style={styles.statBoxFull}>
              <Text style={styles.statLabel}>{t('stats.lastTrained', 'Last Session')}</Text>
              <Text style={styles.statValueDate}>{formatLastActive(selectedStat.lastActiveAt)}</Text>
            </View>
          </View>
        </View>
      ) : (
        <Text style={styles.hintText}>
          {t('stats.tapMuscleHint', 'Tap any muscle group to view detailed training stats')}
        </Text>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#1E1E1E' }]} />
          <Text style={styles.legendText}>0%</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#1E5936' }]} />
          <Text style={styles.legendText}>{t('stats.legendLow', 'Low')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#2D824E' }]} />
          <Text style={styles.legendText}>{t('stats.legendMed', 'Med')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.colorBox, { backgroundColor: '#52D685' }]} />
          <Text style={styles.legendText}>{t('stats.legendHigh', 'High')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 12,
    padding: 3,
    marginBottom: spacing.base,
    width: 180,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: colors.dark.bg.secondary,
  },
  segmentText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.secondary,
  },
  segmentTextActive: {
    color: colors.dark.text.primary,
  },
  svgWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  hintText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.tertiary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  statCard: {
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 12,
    padding: spacing.md,
    width: '100%',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
    paddingBottom: spacing.xs,
  },
  statHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  activeIndicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  statBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.dark.bg.secondary,
    padding: spacing.xs + 2,
    borderRadius: 8,
  },
  statBoxFull: {
    width: '100%',
    backgroundColor: colors.dark.bg.secondary,
    padding: spacing.xs + 2,
    borderRadius: 8,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    color: colors.dark.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  statValueDate: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.dark.accent.info,
  },
  unitText: {
    fontSize: 10,
    fontWeight: 'normal',
    color: colors.dark.text.secondary,
  },
  legend: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
  },
});
