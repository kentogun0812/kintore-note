import { View, Text, ScrollView } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { HankoCalendar } from '@/components/HankoCalendar';
import { Link } from 'expo-router';

export default function HomeScreen() {
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
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: spacing.base, gap: spacing.md }}
    >
      <Card style={{ padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.dark.bg.elevated }}>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="flame" size={28} color={colors.dark.accent.warning} />
            <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.xl, fontWeight: 'bold' }}>
              14日連続！
            </Text>
         </View>
         <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Icon name="trophy-outline" size={16} color={colors.dark.text.secondary} />
            <Text style={{ color: colors.dark.text.secondary, fontSize: typography.fontSize.sm }}>
              Current Streak
            </Text>
         </View>
      </Card>
      
      <Card style={{ padding: spacing.md, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="calendar" size={20} color={colors.dark.accent.primary} />
            <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.lg, fontWeight: 'bold' }}>
              Hanko Calendar
            </Text>
          </View>
          <Text style={{ color: colors.dark.text.tertiary, fontSize: typography.fontSize.sm }}>
            {monthName} {year}
          </Text>
        </View>
        <View style={{ paddingVertical: spacing.sm }}>
           <HankoCalendar year={year} month={month} stampedDates={dummyStampedDates} />
        </View>
      </Card>

      <Card style={{ padding: spacing.md, gap: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="list" size={20} color={colors.dark.accent.primary} />
            <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.lg, fontWeight: 'bold' }}>
              今日のメニュー
            </Text>
          </View>
        </View>
        
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.dark.border.subtle }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
               <Icon name="fitness-outline" size={16} color={colors.dark.text.secondary} />
               <Text style={{ color: colors.dark.text.primary, fontWeight: '500' }}>Bench Press</Text>
             </View>
             <Text style={{ color: colors.dark.text.secondary }}>3 sets</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.dark.border.subtle }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
               <Icon name="fitness-outline" size={16} color={colors.dark.text.secondary} />
               <Text style={{ color: colors.dark.text.primary, fontWeight: '500' }}>Incline Dumbbell Press</Text>
             </View>
             <Text style={{ color: colors.dark.text.secondary }}>3 sets</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.xs }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
               <Icon name="fitness-outline" size={16} color={colors.dark.text.secondary} />
               <Text style={{ color: colors.dark.text.primary, fontWeight: '500' }}>Cable Crossover</Text>
             </View>
             <Text style={{ color: colors.dark.text.secondary }}>4 sets</Text>
          </View>
        </View>

        <Link href="/training/session" asChild>
          <Button label="Start Session" iconName="play" fullWidth />
        </Link>
      </Card>
    </ScrollView>
  );
}
