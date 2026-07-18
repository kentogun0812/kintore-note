import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useTranslation } from 'react-i18next';
import { useAnalyticsStore, TimeRange } from '@/store/analytics.store';
import { MuscleHeatmap } from '@/components/charts/MuscleHeatmap';
import { VolumeChart } from '@/components/charts/VolumeChart';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';
import { useAuthStore } from '@/store/auth.store';
import { useState, useEffect } from 'react';

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const { 
    heatmapData, 
    chartData, 
    isLoadingHeatmap, 
    isLoadingChart, 
    fetchHeatmapData, 
    fetchVolumeChartData 
  } = useAnalyticsStore();

  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [exercises, setExercises] = useState<{ id: string, name: string }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Load Heatmap data
  useEffect(() => {
    fetchHeatmapData(timeRange);
  }, [timeRange]);

  // Load Exercises for the chart picker
  useEffect(() => {
    const loadExercises = async () => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const allEx = ExerciseRepository.getAllExercises(userId);
      const data = allEx.slice(0, 15); // Take first 15 exercises to display in trend picker
      if (data && data.length > 0) {
        setExercises(data.map((ex: any) => ({ 
          id: ex.id, 
          name: i18n.language === 'ja' ? ex.name_ja : ex.name_en 
        })));
        setSelectedExercise(data[0].id);
      }
    };
    loadExercises();
  }, [i18n.language]);

  // Load Chart data
  useEffect(() => {
    if (selectedExercise) {
      fetchVolumeChartData(selectedExercise, timeRange);
    }
  }, [selectedExercise, timeRange]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>{t('stats.title', 'Analytics')}</Text>
          <View style={styles.rangeSelector}>
            {(['7d', '30d', 'all'] as TimeRange[]).map((r) => (
              <Text 
                key={r}
                style={[styles.rangeOption, timeRange === r && styles.rangeOptionActive]}
                onPress={() => setTimeRange(r)}
              >
                {r.toUpperCase()}
              </Text>
            ))}
          </View>
        </View>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('stats.muscleHeatmap', 'Muscle Heatmap')}</Text>
          {isLoadingHeatmap ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            <MuscleHeatmap data={heatmapData} />
          )}
        </Card>
        
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('stats.volumeTrend', 'Volume Trend')}</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseSelector}>
            {exercises.map(ex => (
              <Text 
                key={ex.id} 
                style={[styles.exercisePill, selectedExercise === ex.id && styles.exercisePillActive]}
                onPress={() => setSelectedExercise(ex.id)}
              >
                {ex.name}
              </Text>
            ))}
          </ScrollView>

          {isLoadingChart ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : selectedExercise ? (
            <VolumeChart data={chartData} />
          ) : (
            <Text style={styles.emptyText}>No exercise selected.</Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  screenTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'heavy',
    color: colors.dark.text.primary,
    marginBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: 8,
    padding: 4,
  },
  rangeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  rangeOptionActive: {
    color: colors.dark.text.primary,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: 6,
    overflow: 'hidden',
  },
  sectionCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  loadingText: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  emptyText: {
    color: colors.dark.text.tertiary,
    textAlign: 'center',
    marginVertical: spacing.xl,
  },
  exerciseSelector: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  exercisePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.dark.bg.tertiary,
    color: colors.dark.text.secondary,
    borderRadius: 16,
    marginRight: 8,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  exercisePillActive: {
    backgroundColor: colors.dark.accent.primary,
    color: colors.white,
  }
});
