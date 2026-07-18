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
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';
import { useTrainingStore } from '@/store/training.store';
import { useWeeklyPlanStore } from '@/store/weekly-plan.store';
import { WorkoutRepository } from '@/infra/repositories/workout.repository';
import { useTranslation } from 'react-i18next';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { WelcomePopup } from '@/components/WelcomePopup';
import { APP_NAME } from '@/constants/app';
import { MuscleGroupIcon } from '@/components/MuscleGroupIcon';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { user, isGuest } = useAuthStore();
  const { startSession } = useTrainingStore();
  const { activeWeeklyPlan, fetchWeeklyPlans, fetchPlanTemplates } = useWeeklyPlanStore();
  const [planTemplates, setPlanTemplates] = useState<any[]>([]);

  const logoScale = useSharedValue(1);
  const logoRotate = useSharedValue(0);

  useEffect(() => {
    fetchWeeklyPlans();
  }, []);

  useEffect(() => {
    if (activeWeeklyPlan) {
      fetchPlanTemplates(activeWeeklyPlan.id).then(setPlanTemplates);
    }
  }, [activeWeeklyPlan]);

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
  }, []);

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` }
    ],
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

  const activeRoutine = useMemo(() => {
    if (!exercisesForDate) return [];
    return exercisesForDate.map(ex => ({
      id: ex.id,
      name: i18n.language === 'ja' ? ex.name_ja : ex.name_en,
      muscleGroupId: ex.muscle_group_id,
      sets: ex.setsCount,
    }));
  }, [exercisesForDate, i18n.language]);

  const isTodaySelected = selectedDate === todayDateString;
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });

  const currentWeek = 1;
  const currentTemplate = activeWeeklyPlan ? planTemplates.find(r => r.plan_week === currentWeek) : null;

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

        {activeWeeklyPlan && (
          <Card style={styles.weeklyPlanCard}>
            <View style={styles.weeklyPlanHeader}>
              <View>
                <Text style={styles.weeklyPlanTitle}>{t('weeklyPlan.activePlan', 'Active Plan')}</Text>
                <Text style={styles.weeklyPlanName}>{activeWeeklyPlan.name}</Text>
              </View>
            </View>
            <Text style={styles.weeklyPlanDetails}>
              {t('weeklyPlan.weekN', { n: currentWeek, defaultValue: `Week ${currentWeek}` })}
            </Text>
            {currentTemplate ? (
              <View style={styles.weeklyPlanRoutine}>
                <Text style={styles.weeklyPlanRoutineName}>{currentTemplate.name}</Text>
                <Button
                  label={t('home.startSession')}
                  size="sm"
                  onPress={() => {
                    console.log('Start template', currentTemplate.id);
                    const sessionExercises = [{ id: currentTemplate.id, name: currentTemplate.name }];
                    startSession(sessionExercises);
                    router.push('/training/session');
                  }}
                />
              </View>
            ) : (
              <Text style={styles.weeklyPlanDetails}>{t('weeklyPlan.noWorkoutThisWeek', 'No workout assigned for this week.')}</Text>
            )}

            <Link href={`/training/weekly-plan/${activeWeeklyPlan.id}`} asChild>
              <Pressable style={styles.viewWeeklyPlanButton}>
                <Text style={styles.viewWeeklyPlanText}>{t('weeklyPlan.viewSchedule', 'View Schedule')}</Text>
                <Icon name="arrow-forward" size={16} color={colors.dark.accent.primary} />
              </Pressable>
            </Link>
          </Card>
        )}

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
          </View>

          <View style={styles.modernRoutineList}>
            {activeRoutine.length > 0 ? (
              activeRoutine.map((item, index) => {
                const isLast = index === activeRoutine.length - 1;
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
              })
            ) : (
              <View style={styles.emptyRoutineContainer}>
                <Icon name="calendar-outline" size={32} color={colors.dark.text.tertiary} />
                <Text style={styles.emptyRoutineText}>{t('home.noTraining')}</Text>
              </View>
            )}
          </View>

          {isTodaySelected && (
            <Button
              label={t('home.startSession')}
              fullWidth
              onPress={() => {
                const sessionExercises = activeRoutine.map((m, idx) => ({
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
  weeklyPlanCard: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.dark.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary + '50',
  },
  weeklyPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weeklyPlanTitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  weeklyPlanName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  weeklyPlanDetails: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  weeklyPlanRoutine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.primary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  weeklyPlanRoutineName: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    flex: 1,
  },
  viewWeeklyPlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  viewWeeklyPlanText: {
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
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
});
