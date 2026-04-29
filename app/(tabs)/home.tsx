import { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { WelcomePopup } from '@/components/WelcomePopup';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { user, isGuest } = useAuthStore();
  const { showWelcome, dismissWelcome } = useOnboardingStore();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.premiumHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.logoRow}>
              <Icon name="barbell" size={24} color={colors.dark.accent.primary} />
              <Text style={styles.logoKanji}>筋</Text>
            </View>
            <Text style={styles.appName}>筋トレノート</Text>
            <Text style={styles.appSubtitle}>毎日少しずつ。</Text>
          </View>

          <View style={styles.avatarWrapper}>
            {isGuest && (
              <Animated.View entering={FadeInRight.delay(800)} style={styles.loginSuggestion}>
                <Text style={styles.suggestionText}>{t('home.loginToSync')}</Text>
                <View style={styles.bubbleTail} />
              </Animated.View>
            )}
            <Pressable 
              onPress={() => router.push('/settings')}
              style={({ pressed }) => [
                styles.premiumAvatarContainer,
                { opacity: pressed ? 0.7 : 1 }
              ]}
            >
              <Text style={styles.avatarEmoji}>🧔‍♂️</Text>
            </Pressable>
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
            <Link href="/training/session" asChild>
              <Button label={t('home.startSession')} iconName="play" fullWidth />
            </Link>
          )}
        </Card>
      </ScrollView>

      <WelcomePopup visible={showWelcome} onDismiss={dismissWelcome} />
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
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    gap: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  logoKanji: {
    color: colors.dark.accent.primary,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  appName: {
    color: colors.white,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    letterSpacing: 1.5,
  },
  appSubtitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1,
    marginTop: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  premiumAvatarContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.dark.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  loginSuggestion: {
    position: 'absolute',
    top: -40,
    right: 10,
    backgroundColor: colors.dark.accent.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    width: 140,
  },
  suggestionText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -6,
    right: 15,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: colors.dark.accent.primary,
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
