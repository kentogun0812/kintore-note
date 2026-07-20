import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useWeeklyPlanStore } from '@/store/weekly-plan.store';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';

interface WorkoutPreset {
  name_ja: string;
  name_en: string;
  exercises: string[];
}

interface TemplatePreset {
  id: string;
  name_ja: string;
  name_en: string;
  desc_ja: string;
  desc_en: string;
  days: number;
  weeks: number;
  level: 'beginner' | 'experienced';
  workouts: { [day: number]: WorkoutPreset };
}

export default function PresetTemplatesScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { t, i18n } = useTranslation();
  const { applyPresetTemplate, weeklyPlans, updateWeeklyPlan, presetTemplates, fetchPresetTemplates } = useWeeklyPlanStore();
  
  const [exercisesList, setExercisesList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'beginner' | 'experienced'>('beginner');
  const [expandedPresetId, setExpandedPresetId] = useState<string | null>(null);

  useEffect(() => {
    const list = ExerciseRepository.getAllExercises();
    setExercisesList(list);
    fetchPresetTemplates();
  }, []);

  const getExerciseName = (exId: string) => {
    const ex = exercisesList.find(e => e.id === exId);
    if (!ex) return exId;
    return i18n.language === 'ja' ? ex.name_ja : ex.name_en;
  };

  const handleApplyTemplate = async (preset: TemplatePreset) => {
    if (!planId) return;
    const plan = weeklyPlans.find(p => p.id === planId);
    if (!plan) return;

    const presetName = i18n.language === 'ja' ? preset.name_ja : preset.name_en;

    await applyPresetTemplate(planId, preset.id, presetName);
    
    // Update weeks dynamically if applying preset
    let planName = plan.name;
    if (!planName || planName.trim() === '') {
      planName = presetName;
    }
    await updateWeeklyPlan(planId, planName, preset.weeks, plan.start_date || undefined);

    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('weeklyPlan.suggestTemplates'),
          headerLargeTitle: false,
          headerBackVisible: true,
          headerShown: false, 
        }} 
      />

      <View style={styles.customHeader}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={8} 
          style={styles.headerBackButton}
        >
          <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('weeklyPlan.suggestTemplates')}</Text>
        <View style={styles.headerActionButton} />
      </View>

      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tabButton, activeTab === 'beginner' && styles.activeTabButton]}
          onPress={() => {
            setActiveTab('beginner');
            setExpandedPresetId(null);
          }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'beginner' && styles.activeTabButtonText]}>
            {t('weeklyPlan.beginner')}
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabButton, activeTab === 'experienced' && styles.activeTabButton]}
          onPress={() => {
            setActiveTab('experienced');
            setExpandedPresetId(null);
          }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'experienced' && styles.activeTabButtonText]}>
            {t('weeklyPlan.experienced')}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.presetsListContent} showsVerticalScrollIndicator={false}>
        {presetTemplates.filter(p => p.level === activeTab).map((preset: TemplatePreset) => {
          const isExpanded = expandedPresetId === preset.id;
          const presetName = i18n.language === 'ja' ? preset.name_ja : preset.name_en;
          const presetDesc = i18n.language === 'ja' ? preset.desc_ja : preset.desc_en;

          return (
            <View key={preset.id} style={styles.presetCard}>
              <Pressable 
                style={styles.presetCardHeader}
                onPress={() => setExpandedPresetId(isExpanded ? null : preset.id)}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.presetCardTitle}>{presetName}</Text>
                  <Text style={styles.presetCardDesc}>{presetDesc}</Text>
                </View>
                <Icon 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.dark.text.secondary} 
                />
              </Pressable>

              {isExpanded && (
                <View style={styles.presetCardDetails}>
                  <View style={styles.daysContainer}>
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((dayNum) => {
                      const workout = preset.workouts[dayNum];
                      const workoutName = workout ? (i18n.language === 'ja' ? workout.name_ja : workout.name_en) : '';

                      return (
                        <View key={dayNum} style={styles.presetDayRow}>
                          <View style={styles.presetDayHeader}>
                            <Text style={styles.presetDayLabel}>{t('weeklyPlan.dayN', { n: dayNum })}</Text>
                            {workout ? (
                              <Text style={styles.presetWorkoutName}>{workoutName}</Text>
                            ) : (
                              <Text style={styles.presetRestDayLabel}>{t('weeklyPlan.restDay')}</Text>
                            )}
                          </View>
                          
                          {workout && (
                            <View style={styles.presetExercisesList}>
                              <Text style={styles.presetExercisesHeader}>{t('weeklyPlan.presetExercises')}:</Text>
                              <Text style={styles.presetExercisesText}>
                                {workout.exercises.map(exId => getExerciseName(exId)).join(', ')}
                              </Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>

                  <Button 
                    label={t('weeklyPlan.applyThisTemplate')} 
                    fullWidth 
                    onPress={() => handleApplyTemplate(preset)}
                    style={{ marginTop: spacing.md }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.primary,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerActionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.dark.accent.primary,
  },
  tabButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.secondary,
  },
  activeTabButtonText: {
    color: colors.dark.accent.primary,
  },
  presetsListContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  presetCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    overflow: 'hidden',
  },
  presetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  presetCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  presetCardDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    lineHeight: 18,
  },
  presetCardDetails: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.tertiary,
  },
  daysContainer: {
    gap: spacing.sm,
  },
  presetDayRow: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  presetDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetDayLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.tertiary,
  },
  presetWorkoutName: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.dark.accent.primary,
  },
  presetRestDayLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.tertiary,
    fontStyle: 'italic',
  },
  presetExercisesList: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle + '50',
    paddingTop: 4,
  },
  presetExercisesHeader: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.secondary,
    marginBottom: 2,
  },
  presetExercisesText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.primary,
    lineHeight: 18,
  },
});
