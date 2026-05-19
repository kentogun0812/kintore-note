import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
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
import { useOnboardingStore } from '@/store/onboarding.store';
import { useTrainingStore } from '@/store/training.store';
import { useProgramStore } from '@/store/program.store';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { WelcomePopup } from '@/components/WelcomePopup';
import { APP_NAME } from '@/constants/app';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { user, isGuest } = useAuthStore();
  const { startSession } = useTrainingStore();
  const { activeProgram, fetchPrograms, fetchProgramMenus } = useProgramStore();
  const [programMenus, setProgramMenus] = useState<any[]>([]);

  const logoScale = useSharedValue(1);
  const logoRotate = useSharedValue(0);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (activeProgram) {
      fetchProgramMenus(activeProgram.id).then(setProgramMenus);
    }
  }, [activeProgram]);

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

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthYearString = currentDate.toLocaleString(i18n.language, { year: 'numeric', month: 'long' });

  const dummyStampedDates: string[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(currentDate.getDate() - i);
    dummyStampedDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  const todayDateString = `${year}-${String(month).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayDateString);

  // Generate a deterministic mock menu based on date string
  const getMenuForDate = (dateString: string) => {
    if (!dummyStampedDates.includes(dateString) && dateString !== todayDateString) {
      return []; // Return empty menu for dates without training
    }
    
    const charSum = dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (charSum % 3 === 0) {
      return [
        { name: 'Squat', sets: 4, icon: 'fitness' },
        { name: 'Leg Press', sets: 3, icon: 'barbell' },
        { name: 'Calf Raise', sets: 4, icon: 'body' }
      ];
    } else if (charSum % 2 === 0) {
      return [
        { name: 'Deadlift', sets: 3, icon: 'barbell' },
        { name: 'Pull Up', sets: 3, icon: 'body' },
        { name: 'Barbell Row', sets: 4, icon: 'fitness' }
      ];
    } else {
      return [
        { name: 'Bench Press', sets: 3, icon: 'body' },
        { name: 'Incline Dumbbell Press', sets: 3, icon: 'barbell' },
        { name: 'Cable Crossover', sets: 4, icon: 'fitness' }
      ];
    }
  };

  const activeMenu = getMenuForDate(selectedDate);
  const isTodaySelected = selectedDate === todayDateString;
  // Format the selected date for display
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' });

  // Calculate current week for active program
  const getCurrentWeek = () => {
    if (!activeProgram || !activeProgram.start_date) return 1;
    const start = new Date(activeProgram.start_date);
    const now = new Date();
    const diffTime = now.getTime() - start.getTime();
    if (diffTime < 0) return 1; // Not started yet
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const currentWeek = Math.ceil(diffDays / 7) || 1;
    return Math.min(Math.max(currentWeek, 1), activeProgram.total_weeks);
  };

  const currentWeek = getCurrentWeek();
  const currentWeekMenu = programMenus.find(m => m.program_week === currentWeek);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.premiumHeader}>
          <View style={styles.headerLeft}>
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

        {activeProgram && (
          <Card style={styles.programCard}>
             <View style={styles.programHeader}>
               <Icon name="fitness-outline" size={20} color={colors.dark.accent.primary} />
               <Text style={styles.programTitle}>{activeProgram.name}</Text>
             </View>
             <Text style={styles.programDetails}>
               {t('program.weekN', { n: currentWeek, defaultValue: `Week ${currentWeek}` })} / {activeProgram.total_weeks}
             </Text>
             {currentWeekMenu ? (
               <View style={styles.programMenu}>
                  <Text style={styles.programMenuName}>{currentWeekMenu.name}</Text>
                  <Button 
                    label={t('home.startSession')} 
                    size="sm" 
                    iconName="play" 
                    onPress={() => {
                      // Note: in a real app we'd load the full menu exercises here
                      const sessionExercises = [{ id: Math.random().toString(), name: 'Placeholder for ' + currentWeekMenu.name }];
                      startSession(sessionExercises);
                      router.push('/training/session');
                    }} 
                  />
               </View>
             ) : (
               <Text style={styles.programDetails}>{t('program.noMenuThisWeek', 'No menu assigned for this week.')}</Text>
             )}
             
             <Link href={`/training/program/${activeProgram.id}`} asChild>
                <Pressable style={styles.viewProgramButton}>
                   <Text style={styles.viewProgramText}>{t('program.viewSchedule', 'View Schedule')}</Text>
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
            <Text style={styles.sectionSubtitle}>
              {monthYearString}
            </Text>
          </View>
          <View style={styles.calendarContainer}>
             <HankoCalendar 
                year={year} 
                month={month} 
                stampedDates={dummyStampedDates} 
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
                {isTodaySelected ? t('home.todayMenu') : formattedSelectedDate}
              </Text>
            </View>
          </View>
          
          <View style={styles.modernMenuList}>
            {activeMenu.length > 0 ? (
              activeMenu.map((item, index) => {
                const isLast = index === activeMenu.length - 1;
                return (
                  <View key={index} style={[styles.modernMenuItem, !isLast && styles.modernMenuItemBorder]}>
                    <View style={styles.modernMenuInfo}>
                      <View style={styles.modernMenuIconContainer}>
                        <Icon name={item.icon as any} size={16} color={colors.dark.accent.primary} />
                      </View>
                      <Text style={styles.modernMenuName} numberOfLines={1}>{item.name}</Text>
                    </View>
                    <Text style={styles.modernMenuSets}>{item.sets} {t('common.sets')}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyMenuContainer}>
                <Icon name="calendar-outline" size={32} color={colors.dark.text.tertiary} />
                <Text style={styles.emptyMenuText}>{t('home.noTraining')}</Text>
              </View>
            )}
          </View>

          {isTodaySelected && (
            <Button 
              label={t('home.startSession')} 
              iconName="play" 
              fullWidth 
              onPress={() => {
                const sessionExercises = activeMenu.map((m, idx) => ({
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    marginBottom: spacing.md,
  },
  headerLeft: {
    gap: 4,
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
  logoKanji: {
    color: colors.dark.accent.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
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
  appSubtitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1,
    marginTop: 2,
  },
  programCard: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.dark.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary + '50',
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  programTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  programDetails: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  programMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.primary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  programMenuName: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    flex: 1,
  },
  viewProgramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  viewProgramText: {
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
  },
  calendarContainer: {
    paddingVertical: spacing.sm,
  },
  modernMenuList: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  modernMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  modernMenuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.default,
  },
  modernMenuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernMenuInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  modernMenuName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
  modernMenuSets: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  emptyMenuContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  emptyMenuText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
});
