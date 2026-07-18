import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { Link, router, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useWorkoutStore } from '@/store/workout.store';
import { useTrainingStore } from '@/store/training.store';
import { useTranslation } from 'react-i18next';

export default function TrainingScreen() {
  const { t, i18n } = useTranslation();
  const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore();
  const { startSession } = useTrainingStore();

  useFocusEffect(
    useCallback(() => {
      fetchSavedWorkouts();
    }, [])
  );

  const handleStartRoutine = (routine: any) => {
    startSession(routine.exercises);
    router.push('/training/session');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
      <Card style={styles.quickStartCard}>
        <View style={styles.cardHeader}>
          <Icon name="flash" size={20} color={colors.dark.accent.warning} />
          <Text style={styles.cardTitle}>
             {t('record.quickStart')}
          </Text>
        </View>
        <Text style={styles.cardSubtitle}>
           {t('record.quickStartDesc')}
        </Text>
        <Button 
          label={t('record.startEmpty')} 
          fullWidth 
          onPress={() => {
            startSession([]);
            router.push('/training/session');
          }}
        />
      </Card>
      
      <View style={styles.toolsRow}>
        <Link href="/training/weekly-plans" asChild>
          <Pressable style={styles.toolItem}>
            <Card style={styles.toolCard}>
              <Icon name="calendar-outline" size={32} color={colors.dark.accent.primary} />
              <Text style={styles.toolText} numberOfLines={1}>{t('record.weeklyPlans')}</Text>
            </Card>
          </Pressable>
        </Link>
        <Link href="/training/library" asChild>
          <Pressable style={styles.toolItem}>
            <Card style={styles.toolCard}>
              <Icon name="library-outline" size={32} color={colors.dark.accent.primary} />
              <Text style={styles.toolText} numberOfLines={1}>{t('record.exerciseLibrary')}</Text>
            </Card>
          </Pressable>
        </Link>
      </View>
      
      <View style={styles.sectionHeader}>
        <Icon name="bookmarks-outline" size={20} color={colors.dark.text.primary} />
        <Text style={styles.sectionTitle}>
           {t('record.savedWorkouts')}
        </Text>
      </View>

      {savedWorkouts.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Icon name="document-text-outline" size={28} color={colors.dark.text.tertiary} />
          <Text style={styles.emptyText}>
            {t('record.noWorkouts')}
          </Text>
        </Card>
      ) : (
        savedWorkouts.map(routine => (
          <Card key={routine.id} style={styles.routineCard}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineName}>{routine.name}</Text>
              <Text style={styles.routineExerciseCount}>{routine.exercises.length} {t('common.exercises')}</Text>
            </View>
            
            <View style={styles.modernExerciseList}>
              {routine.exercises.slice(0, 3).map((ex, index) => {
                const showBorder = index < Math.min(routine.exercises.length, 3) - 1 || routine.exercises.length > 3;
                return (
                  <View key={ex.id} style={[styles.modernExerciseItem, showBorder && styles.modernExerciseItemBorder]}>
                    <View style={styles.modernExerciseInfo}>
                      <View style={styles.modernExerciseIconContainer}>
                        <Icon name="barbell-outline" size={14} color={colors.dark.accent.primary} />
                      </View>
                      <Text style={styles.modernExerciseName} numberOfLines={1}>
                        {i18n.language === 'ja' ? ex.name_ja : ex.name_en}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {routine.exercises.length > 3 && (
                <View style={styles.modernExerciseItem}>
                  <View style={styles.modernExerciseInfo}>
                    <View style={[styles.modernExerciseIconContainer, { backgroundColor: 'transparent' }]}>
                      <Icon name="ellipsis-horizontal" size={14} color={colors.dark.text.tertiary} />
                    </View>
                    <Text style={[styles.modernExerciseName, { color: colors.dark.text.tertiary }]} numberOfLines={1}>
                      +{routine.exercises.length - 4} {t('common.more')}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button 
                label={t('common.edit')} 
                variant="outline" 
                size="md" 
                onPress={() => router.push({ pathname: '/training/template/[id]', params: { id: routine.id } })} 
                style={(state) => ({ 
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: colors.dark.border.light,
                  backgroundColor: state.pressed ? colors.dark.bg.secondary : colors.dark.bg.tertiary
                })}
              />
              <Button 
                label={t('home.startSession')} 
                variant="outline" 
                size="md" 
                onPress={() => handleStartRoutine(routine)} 
                style={(state) => ({
                  flex: 1,
                  borderWidth: 0.5,
                  borderColor: colors.dark.border.light,
                  backgroundColor: state.pressed ? colors.dark.bg.secondary : colors.dark.bg.tertiary
                })}
              />
            </View>
          </Card>
        ))
      )}
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
  quickStartCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    marginBottom: spacing.sm,
  },
  toolsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  toolItem: {
    flex: 1,
  },
  toolCard: {
    padding: spacing.md,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    gap: spacing.xs,
  },
  toolText: {
    color: colors.dark.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    fontSize: typography.fontSize.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  emptyCard: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  emptyText: {
    color: colors.dark.text.secondary,
    paddingVertical: spacing.sm,
  },
  routineCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  routineExerciseCount: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
  },
  modernExerciseList: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  modernExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  modernExerciseItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.default,
  },
  modernExerciseIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernExerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  modernExerciseName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    flexShrink: 1,
  },
});
