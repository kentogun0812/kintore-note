import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { useTranslation } from 'react-i18next';

interface HankoCalendarProps {
  year: number;
  month: number;
  stampedDates: string[];
  selectedDate?: string;
  onDatePress?: (dateString: string) => void;
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay();
};

export function HankoCalendar({ year, month, stampedDates, selectedDate, onDatePress }: HankoCalendarProps) {
  const { t } = useTranslation();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); 
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  const weekdays = [
    t('common.weekdays.sun'),
    t('common.weekdays.mon'),
    t('common.weekdays.tue'),
    t('common.weekdays.wed'),
    t('common.weekdays.thu'),
    t('common.weekdays.fri'),
    t('common.weekdays.sat'),
  ];
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {weekdays.map((day, index) => (
          <Text key={index} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isStamped = stampedDates.includes(dateString);
          const isToday = new Date().toISOString().startsWith(dateString);
          const isSelected = selectedDate === dateString;

          return (
            <View key={dateString} style={styles.dayCell}>
               <View 
                  onTouchEnd={() => onDatePress && onDatePress(dateString)}
                  style={[
                    styles.dayCircle, 
                    isToday && styles.todayCircle,
                    isSelected && styles.selectedCircle
                  ]}
                >
                  {isStamped ? (
                     <View style={styles.hankoStampContainer}>
                       <Text style={styles.hankoText}>済</Text>
                       <View style={styles.hankoRing} />
                     </View>
                  ) : (
                     <Text style={[
                       styles.dayText, 
                       isToday && styles.todayText,
                       isSelected && styles.selectedDayText
                     ]}>{day}</Text>
                  )}
               </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.sm,
  },
  weekdayText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
    width: 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  todayCircle: {
    backgroundColor: colors.dark.bg.elevated,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  dayText: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  todayText: {
    color: colors.dark.accent.info,
    fontWeight: 'bold',
  },
  selectedCircle: {
    backgroundColor: colors.dark.alpha.accent20,
  },
  selectedDayText: {
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
  },
  hankoStampContainer: {
    width: '80%',
    height: '80%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-10deg' }], // Slight organic tilt
  },
  hankoRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.dark.accent.primary, // Red Hanko color
    opacity: 0.8,
  },
  hankoText: {
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    opacity: 0.9,
  }
});
