import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { radius, spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { HankoCalendar } from '@/components/HankoCalendar';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { useTrainingStore } from '@/store/training.store';
import { WorkoutRepository } from '@/infra/repositories/workout.repository';
import { useTranslation } from 'react-i18next';
import { useWeeklyPlanStore } from '@/store/weekly-plan.store';
import { useWorkoutStore } from '@/store/workout.store';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { WelcomePopup } from '@/components/WelcomePopup';
import { APP_NAME } from '@/constants/app';
import { MuscleGroupIcon } from '@/components/MuscleGroupIcon';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { user, isGuest } = useAuthStore();
  const { startSession } = useTrainingStore();

  const logoScale = useSharedValue(1);
  const logoRotate = useSharedValue(0);
  
  const restScale = useSharedValue(1);
  const restOpacity = useSharedValue(0.7);

  useEffect(() => {
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
    logoRotate.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 200 }),
        withTiming(-10, { duration: 400 }),
        withTiming(0, { duration: 200 })
      ),
      -1,
      true
    );

    restScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
    restOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500 }),
        withTiming(0.7, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` }
    ],
  }));

  const animatedRestStyle = useAnimatedStyle(() => ({
    transform: [{ scale: restScale.value }],
    opacity: restOpacity.value,
  }));

  const userName = user?.user_metadata?.username || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const todayDateString = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const { data: stampedDates = [] } = useQuery({
    queryKey: ['hankoStampedDates', user?.id],
    queryFn: () => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      return WorkoutRepository.getHankoStampedDates(userId);
    },
  });
  const [selectedDate, setSelectedDate] = useState<string>(todayDateString);

  const { data: exercisesForDate } = useQuery({
    queryKey: ['exercisesForDate', selectedDate],
    queryFn: () => {
      const userId = useAuthStore.getState().user?.id || 'guest';
      return WorkoutRepository.getExercisesForDate(userId, selectedDate);
    },
    enabled: !!selectedDate,
  });

  const { activeWeeklyPlan, fetchWeeklyPlans } = useWeeklyPlanStore();
  const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore();

  useEffect(() => {
    fetchWeeklyPlans();
    fetchSavedWorkouts();
  }, []);
  const [scheduledTemplate, setScheduledTemplate] = useState<any>(null);

  useEffect(() => {
    async function loadScheduled() {
      if (!activeWeeklyPlan || !activeWeeklyPlan.start_date) {
        setScheduledTemplate(null);
        return;
      }
      
      const startStr = activeWeeklyPlan.start_date;
      const start = new Date(startStr + 'T00:00:00');
      const current = new Date(selectedDate + 'T00:00:00');
      
      const diffTime = Date.UTC(current.getFullYear(), current.getMonth(), current.getDate()) - 
                       Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        setScheduledTemplate(null);
        return;
      }
      
      const planWeek = Math.floor(diffDays / 7) + 1;
      const dayOfWeek = (diffDays % 7) + 1;
      
      if (planWeek > activeWeeklyPlan.total_weeks) {
        setScheduledTemplate(null);
        return;
      }
      
      const templates = await useWeeklyPlanStore.getState().fetchPlanTemplates(activeWeeklyPlan.id);
      const todayTemplate = templates.find(t => t.plan_week === planWeek && t.day_of_week === dayOfWeek);
      
      setScheduledTemplate(todayTemplate || null);
    }
    
    loadScheduled();
  }, [activeWeeklyPlan, selectedDate]);

  const displayRoutine = useMemo(() => {
    const planName = scheduledTemplate ? activeWeeklyPlan?.name : undefined;
    if (exercisesForDate && exercisesForDate.length > 0) {
      return {
        type: 'completed',
        planName,
        data: exercisesForDate.map(ex => ({
          id: ex.id,
          name: i18n.language === 'ja' ? ex.name_ja : ex.name_en,
          muscleGroupId: ex.muscle_group_id,
          sets: ex.setsCount,
        }))
      };
    }
    
    if (scheduledTemplate) {
      if (scheduledTemplate.is_rest_day) {
        return { type: 'rest', planName, data: [] };
      }
      
      const fullTemplate = savedWorkouts.find(w => w.id === scheduledTemplate.id);
      if (fullTemplate && fullTemplate.exercises) {
        return {
          type: 'planned',
          name: scheduledTemplate.name,
          planName,
          data: fullTemplate.exercises.map(ex => ({
            id: ex.id,
            name: i18n.language === 'ja' ? ex.name_ja : ex.name_en,
            muscleGroupId: ex.muscle_group_id,
            sets: ex.target_sets,
          }))
        };
      }
      return {
        type: 'planned_basic',
        name: scheduledTemplate.name,
        planName,
        data: []
      }
    }
    
    return { type: 'empty', data: [] };
  }, [exercisesForDate, scheduledTemplate, savedWorkouts, activeWeeklyPlan?.name, i18n.language]);

  const isTodaySelected = selectedDate === todayDateString;
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth() + 1;
  const monthYearString = currentMonthDate.toLocaleString(i18n.language, { year: 'numeric', month: 'long' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.premiumHeader}>
          <View style={styles.headerRightAligned}>
            <View style={styles.logoRow}>
              <Text style={styles.appName}>{APP_NAME}</Text>
              <Animated.View style={animatedLogoStyle}>
                <Icon name="barbell" size={24} color={colors.dark.accent.primary} />
              </Animated.View>
            </View>
            <Text style={styles.welcomeText}>
              {!isGuest ? t('home.welcomeUser', { name: userName }) : t('home.welcomeGuest')}
            </Text>
          </View>
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="calendar" size={20} color={colors.dark.accent.primary} />
              <Text style={styles.sectionTitle}>
                {t('home.hankoCalendar')}
              </Text>
            </View>
            <View style={styles.calendarNav}>
              <Pressable
                onPress={() => setCurrentMonthDate(new Date(year, month - 2, 1))}
                hitSlop={8}
                style={styles.calendarNavButton}
              >
                <Icon name="chevron-back" size={20} color={colors.dark.text.secondary} />
              </Pressable>
              <Text style={styles.sectionSubtitle}>
                {monthYearString}
              </Text>
              <Pressable
                onPress={() => setCurrentMonthDate(new Date(year, month, 1))}
                hitSlop={8}
                style={styles.calendarNavButton}
              >
                <Icon name="chevron-forward" size={20} color={colors.dark.text.secondary} />
              </Pressable>
            </View>
          </View>
          <View style={styles.calendarContainer}>
            <HankoCalendar
              year={year}
              month={month}
              stampedDates={stampedDates}
              selectedDate={selectedDate}
              onDatePress={(date) => setSelectedDate(date)}
            />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="list" size={20} color={colors.dark.accent.primary} />
              <Text style={styles.sectionTitle}>
                {isTodaySelected ? t('home.todayRoutine') : formattedSelectedDate}
              </Text>
            </View>
            {displayRoutine.planName && (
              <View style={[styles.planNameBadge, { maxWidth: '50%', paddingLeft: spacing.sm }]}>
                <Text style={[styles.planNameText, { color: colors.dark.text.secondary }]} numberOfLines={1}>
                  <Text style={{ color: colors.dark.accent.secondary }}>{displayRoutine.planName}</Text>
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modernRoutineList}>
            {displayRoutine.type === 'rest' && (
              <View style={[styles.emptyRoutineContainer, { backgroundColor: colors.dark.bg.tertiary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.dark.border.subtle, paddingVertical: spacing.lg }]}>
                <Animated.View style={animatedRestStyle}>
                  <Icon name="bed-outline" size={48} color={colors.dark.accent.primary} />
                </Animated.View>
                <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm, textAlign: 'center', marginTop: spacing.xs }}>
                  {t('home.enjoyRest')}
                </Text>
              </View>
            )}
            
            {displayRoutine.type === 'empty' && (
              <View style={styles.emptyRoutineContainer}>
                <Icon name="calendar-outline" size={32} color={colors.dark.text.tertiary} />
                <Text style={styles.emptyRoutineText}>{t('home.noTraining')}</Text>
              </View>
            )}

            {(displayRoutine.type === 'completed' || displayRoutine.type === 'planned') && displayRoutine.data.map((item: any, index: number) => {
              const isLast = index === displayRoutine.data.length - 1;
              return (
                <View key={index} style={[styles.modernRoutineItem, !isLast && styles.modernRoutineItemBorder]}>
                  <View style={styles.modernRoutineInfo}>
                    <View style={styles.modernRoutineIconContainer}>
                      <MuscleGroupIcon id={item.muscleGroupId} size={22} color={colors.dark.accent.primary} />
                    </View>
                    <Text style={styles.modernRoutineName} numberOfLines={1}>{item.name}</Text>
                  </View>
                  <Text style={styles.modernRoutineSets}>{item.sets} {t('common.sets')}</Text>
                </View>
              );
            })}
            
            {displayRoutine.type === 'planned_basic' && (
               <View style={styles.modernRoutineItem}>
                  <View style={styles.modernRoutineInfo}>
                    <View style={styles.modernRoutineIconContainer}>
                      <Icon name="document-text" size={22} color={colors.dark.accent.primary} />
                    </View>
                    <Text style={styles.modernRoutineName} numberOfLines={1}>{displayRoutine.name}</Text>
                  </View>
               </View>
            )}
          </View>

          {isTodaySelected && displayRoutine.type !== 'rest' && (
            <Button
              label={displayRoutine.type === 'completed' ? t('home.startSession') : (displayRoutine.name ? `Start "${displayRoutine.name}"` : t('home.startSession'))}
              fullWidth
              onPress={() => {
                const sessionExercises = displayRoutine.data.map((m: any) => ({
                  id: Math.random().toString(),
                  name: m.name
                }));
                startSession(sessionExercises);
                router.push('/training/session');
              }}
            />
          )}
        </Card>
      </ScrollView>
      <WelcomePopup />
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
    paddingBottom: 100,
    gap: spacing.md,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  headerRightAligned: {
    gap: 4,
    alignItems: 'flex-end',
  },
  welcomeText: {
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'serif',
    letterSpacing: 2,
    textShadowColor: colors.dark.accent.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  sectionCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  calendarNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  calendarNavButton: {
    padding: 2,
  },
  calendarContainer: {
    paddingVertical: spacing.sm,
  },
  modernRoutineList: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  modernRoutineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  modernRoutineItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.default,
  },
  modernRoutineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernRoutineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  modernRoutineName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  modernRoutineSets: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  emptyRoutineContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  emptyRoutineText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  planNameBadge: {
    backgroundColor: colors.dark.accent.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    maxWidth: 140,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary + '30',
  },
  planNameText: {
    color: colors.dark.accent.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
});
