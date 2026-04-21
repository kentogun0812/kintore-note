import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { HankoCalendar } from '@/components/HankoCalendar';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Generate some dummy stamped dates (e.g., today minus 1, 2, 3 days to match 14 day streak idea)
  const dummyStampedDates = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(currentDate.getDate() - i);
    dummyStampedDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Home Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Good morning,</Text>
            <Text style={styles.nameText}>
              {user?.email?.split('@')[0] || 'Lifter'}
            </Text>
          </View>
          <Pressable 
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [
              styles.avatar,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={styles.avatarEmoji}>🧔‍♂️</Text>
          </Pressable>
        </View>

        <Card style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Icon name="flame" size={28} color={colors.dark.accent.warning} />
            <Text style={styles.streakValue}>
              14日連続！
            </Text>
          </View>
          <View style={styles.streakInfo}>
            <Icon name="trophy-outline" size={16} color={colors.dark.text.secondary} />
            <Text style={styles.streakLabel}>
              Current Streak
            </Text>
          </View>
        </Card>
        
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="calendar" size={20} color={colors.dark.accent.primary} />
              <Text style={styles.sectionTitle}>
                Hanko Calendar
              </Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              {monthName} {year}
            </Text>
          </View>
          <View style={styles.calendarContainer}>
             <HankoCalendar year={year} month={month} stampedDates={dummyStampedDates} />
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="list" size={20} color={colors.dark.accent.primary} />
              <Text style={styles.sectionTitle}>
                今日のメニュー
              </Text>
            </View>
          </View>
          
          <View style={styles.menuList}>
            <View style={styles.menuItem}>
               <View style={styles.menuItemInfo}>
                 <Icon name="fitness-outline" size={16} color={colors.dark.text.secondary} />
                 <Text style={styles.menuItemName}>Bench Press</Text>
               </View>
               <Text style={styles.menuItemSets}>3 sets</Text>
            </View>
            <View style={styles.menuItem}>
               <View style={styles.menuItemInfo}>
                 <Icon name="fitness-outline" size={16} color={colors.dark.text.secondary} />
                 <Text style={styles.menuItemName}>Incline Dumbbell Press</Text>
               </View>
               <Text style={styles.menuItemSets}>3 sets</Text>
            </View>
            <View style={styles.menuItemLast}>
               <View style={styles.menuItemInfo}>
                 <Icon name="fitness-outline" size={16} color={colors.dark.text.secondary} />
                 <Text style={styles.menuItemName}>Cable Crossover</Text>
               </View>
               <Text style={styles.menuItemSets}>4 sets</Text>
            </View>
          </View>

          <Link href="/training/session" asChild>
            <Button label="Start Session" iconName="play" fullWidth />
          </Link>
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
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  welcomeText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  nameText: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.bg.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  streakCard: {
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.bg.elevated,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  streakValue: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakLabel: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
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
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.sm,
  },
  calendarContainer: {
    paddingVertical: spacing.sm,
  },
  menuList: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  menuItemLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  menuItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuItemName: {
    color: colors.dark.text.primary,
    fontWeight: '500',
  },
  menuItemSets: {
    color: colors.dark.text.secondary,
  },
});
