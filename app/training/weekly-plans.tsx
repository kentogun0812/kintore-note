import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useWeeklyPlanStore, WeeklyPlan } from '@/store/weekly-plan.store';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { useIsFocused } from '@react-navigation/native';

export default function WeeklyPlansListScreen() {
  const { t } = useTranslation();
  const { weeklyPlans, fetchWeeklyPlans, createWeeklyPlan } = useWeeklyPlanStore();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadPlans();
    }
  }, [isFocused]);

  const loadPlans = async () => {
    setIsLoading(true);
    await fetchWeeklyPlans();
    setIsLoading(false);
  };

  const handleAddPlan = async () => {
    setIsCreating(true);
    const newId = await createWeeklyPlan('', 0);
    setIsCreating(false);
    if (newId) {
      router.push({ pathname: `/training/weekly-plan/${newId}`, params: { isNew: 'true' } });
    }
  };

  const renderPlanItem = ({ item }: { item: WeeklyPlan }) => {
    return (
      <Pressable onPress={() => router.push(`/training/weekly-plan/${item.id}`)}>
        <Card style={styles.planCard}>
          <View style={styles.planCardInner}>
            <View style={styles.planContent}>
              <View style={styles.planHeaderRow}>
                <Text style={styles.planName} numberOfLines={1}>{item.name || t('weeklyPlan.unnamedPlan', 'Unnamed Plan')}</Text>
                
                <View style={styles.badgesRow}>
                  {item.is_active && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>{t('weeklyPlan.active')}</Text>
                    </View>
                  )}
                  <View style={styles.weekBadge}>
                    <Text style={styles.weekBadgeText}>
                      {item.total_weeks} {t('weeklyPlan.weeks')}
                    </Text>
                  </View>
                </View>
              </View>

              {item.start_date ? (
                <Text style={styles.planTemplatesText} numberOfLines={1}>
                  {t('weeklyPlan.starts')}: {new Date(item.start_date).toLocaleDateString()}
                </Text>
              ) : (
                <Text style={styles.planTemplatesTextEmpty} numberOfLines={1}>
                  {t('weeklyPlan.startDateNotSet')}
                </Text>
              )}
            </View>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.customHeader}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={8} 
          style={styles.headerBackButton}
        >
          <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('nav.weeklyPlans')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={weeklyPlans}
        keyExtractor={(item) => item.id}
        renderItem={renderPlanItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Icon name="calendar-outline" size={48} color={colors.dark.border.subtle} />
              <Text style={styles.emptyText}>{t('weeklyPlan.emptyPlans')}</Text>
            </View>
          ) : null
        }
      />
      
      <View style={styles.footer}>
        <Button 
          label={t('common.add')} 
          fullWidth 
          disabled={isCreating}
          onPress={handleAddPlan} 
        />
      </View>
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
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  listContent: {
    padding: spacing.base,
    gap: spacing.md,
  },
  planCard: {
    padding: spacing.md,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  planCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planContent: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.ss,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  weekBadge: {
    backgroundColor: colors.dark.bg.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  weekBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.secondary,
    fontWeight: 'bold',
  },
  planTemplatesText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
  },
  planTemplatesTextEmpty: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.tertiary,
    fontStyle: 'italic',
  },
  planName: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.dark.accent.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary,
  },
  activeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
  },

  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyText: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
  },
});
