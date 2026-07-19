import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
import { useWorkoutStore } from '@/store/workout.store';
import { useTranslation } from 'react-i18next';
import { ExerciseRepository, ExerciseModel } from '@/infra/repositories/exercise.repository';
import { useAuthStore } from '@/store/auth.store';
import { AppErrorHandler, ValidationError } from '@/lib/error-handler';

export default function ExerciseDetailScreen() {
  const { t, i18n } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const addExercise = useWorkoutStore((state) => state.addExerciseToWorkout);
  const [exercise, setExercise] = useState<ExerciseModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    try {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const data = ExerciseRepository.getExerciseById(Array.isArray(id) ? id[0] : id, userId);
      if (data) {
        setExercise(data);
      } else {
        AppErrorHandler.handleError(new ValidationError(t('common.unknownError'), 'EXERCISE_NOT_FOUND'));
        router.back();
      }
    } catch (err) {
      AppErrorHandler.handleError(err);
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  const handleAddToRoutine = () => {
    if (!exercise) return;
    addExercise({ 
      id: exercise.id, 
      name_ja: exercise.name_ja,
      name_en: exercise.name_en,
      muscle_group_id: exercise.muscle_group_id,
    });
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.dark.accent.primary} />
      </View>
    );
  }

  if (!exercise) return null;

  const exerciseName = i18n.language === 'ja' ? exercise.name_ja : exercise.name_en;
  const muscleGroupText = exercise.muscle_groups
    ? (i18n.language === 'ja' ? exercise.muscle_groups.name_ja : exercise.muscle_groups.name_en)
    : '';

  return (
    <ScrollView 
      contentInsetAdjustmentBehavior="automatic"
      style={styles.container}
    >
      <Stack.Screen options={{ title: t('exerciseDetail.title'), headerLargeTitle: false }} />
      
      <View style={styles.imagePlaceholder}>
        <Icon name="barbell-outline" size={64} color={colors.dark.text.tertiary} />
      </View>
      
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>
            {exerciseName}
          </Text>
          {muscleGroupText ? (
            <Text style={styles.category}>
              {muscleGroupText}
            </Text>
          ) : null}
        </View>

        <Button 
          label={t('exerciseDetail.addToRoutine')} 
          iconName="add-circle"
          fullWidth
          style={styles.addButton}
          onPress={handleAddToRoutine}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: colors.dark.bg.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  category: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.md,
    marginTop: spacing.xs,
  },
  addButton: {
    marginTop: spacing.xl,
  },
});

