import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { useWeeklyPlanStore } from '@/store/weekly-plan.store';
import { useWorkoutStore } from '@/store/workout.store';
import { useAuthStore } from '@/store/auth.store';
import { useTranslation } from 'react-i18next';
import { WorkoutTemplateRepository } from '@/infra/repositories/workout-template.repository';
import { useExercisePicker } from '@/features/training/hooks/use-exercise-picker';
import { ExercisePicker } from '@/features/training/components/ExercisePicker';
import { CreateCustomMGModal } from '@/features/training/components/CreateCustomMGModal';
import { CreateCustomExerciseModal } from '@/features/training/components/CreateCustomExerciseModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppErrorHandler, BusinessError } from '@/lib/error-handler';

const dangerousCharsRegex = /[<>"';\\\{\}\[\]]/;

export default function SelectWorkoutScreen() {
  const { planId, week, day } = useLocalSearchParams<{ planId: string, week: string, day: string }>();
  const { t, i18n } = useTranslation();
  const { assignToDay } = useWeeklyPlanStore();
  const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore();
  
  const [isCreatingNewWorkout, setIsCreatingNewWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [workoutNameError, setWorkoutNameError] = useState<string | null>(null);

  const newWorkoutPicker = useExercisePicker([]);

  useEffect(() => {
    fetchSavedWorkouts();
  }, []);

  const weekNum = parseInt(week || '0', 10);
  const dayNum = parseInt(day || '0', 10);

  const handleSelectTemplate = async (templateId: string | null) => {
    if (planId && weekNum > 0 && dayNum > 0) {
      try {
        await assignToDay(planId, templateId, weekNum, dayNum, false);
        router.back();
      } catch (err: any) {
        AppErrorHandler.handleError(err);
      }
    }
  };

  const handleSaveNewWorkoutTemplate = async () => {
    const trimmedName = newWorkoutName.trim();
    if (!trimmedName) {
      setWorkoutNameError(t('todayWorkout.nameEmpty'));
      return;
    }
    if (trimmedName.length > 50) {
      setWorkoutNameError(t('todayWorkout.nameTooLong'));
      return;
    }
    if (dangerousCharsRegex.test(trimmedName)) {
      setWorkoutNameError(t('todayWorkout.nameInvalidChars'));
      return;
    }

    try {
      const userId = useAuthStore.getState().user?.id || 'guest';
      if (userId === 'guest' && savedWorkouts.length >= 1) {
        AppErrorHandler.handleError(new BusinessError(t('todayWorkout.guestLimitDesc'), 'GUEST_LIMIT_REACHED'));
        return;
      }

      const selectedExercises = newWorkoutPicker.selectedExerciseIds.map(exId => {
        return newWorkoutPicker.allExercises.find(e => e.id === exId);
      }).filter((ex): ex is any => !!ex).map(ex => ({
        id: ex.id,
        name: i18n.language === 'ja' ? ex.name_ja : ex.name_en
      }));

      const templateId = WorkoutTemplateRepository.saveWorkoutTemplate(userId, trimmedName, selectedExercises);
      await fetchSavedWorkouts();

      if (planId && weekNum > 0 && dayNum > 0) {
        await assignToDay(planId, templateId, weekNum, dayNum, false);
      }

      setIsCreatingNewWorkout(false);
      setNewWorkoutName('');
      newWorkoutPicker.setSelectedExerciseIds([]);

      Alert.alert(t('common.success'), t('session.workoutSaved'), [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      AppErrorHandler.handleError(err);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('weeklyPlan.selectWorkout'),
          headerShown: false,
        }} 
      />

      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            if (isCreatingNewWorkout) {
              setIsCreatingNewWorkout(false);
              setNewWorkoutName('');
              newWorkoutPicker.setSelectedExerciseIds([]);
            } else {
              router.back();
            }
          }} 
          hitSlop={8} 
          style={styles.headerBackButton}
        >
          <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {isCreatingNewWorkout ? t('weeklyPlan.createNewWorkout') : t('weeklyPlan.selectWorkout')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {isCreatingNewWorkout ? (
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={[styles.formContainer, { paddingBottom: 0 }]}>
              <Text style={styles.modalInputLabel}>{t('todayWorkout.workoutName')}</Text>
              <TextInput
                value={newWorkoutName}
                onChangeText={(text) => {
                  setNewWorkoutName(text);
                  setWorkoutNameError(null);
                }}
                placeholder={t('todayWorkout.placeholder')}
                placeholderTextColor={colors.dark.text.tertiary}
                style={[styles.modalTextInput, workoutNameError ? styles.textInputError : null]}
              />
              {workoutNameError ? <Text style={styles.errorText}>{workoutNameError}</Text> : null}
            </View>
          </TouchableWithoutFeedback>

          <View style={{ flex: 1 }}>
            <ExercisePicker picker={newWorkoutPicker} />
          </View>

          <View style={styles.footer}>
            <Button
              label={t('common.save')}
              fullWidth
              disabled={!newWorkoutName.trim() || newWorkoutPicker.selectedExerciseIds.length === 0}
              onPress={handleSaveNewWorkoutTemplate}
            />
          </View>
        </KeyboardAvoidingView>
      ) : (
        <FlatList 
          data={savedWorkouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.routineList}
          ListHeaderComponent={
            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
              <Button
                label={t('weeklyPlan.createNewWorkout')}
                iconName="add-circle"
                variant="outline"
                onPress={() => setIsCreatingNewWorkout(true)}
              />
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t('weeklyPlan.noSavedWorkouts')}</Text>
          }
          renderItem={({ item }) => (
            <Pressable style={styles.routineCardItem} onPress={() => handleSelectTemplate(item.id)}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.routineCardName}>{item.name}</Text>
                <Text style={styles.routineCardDetails}>
                  {item.exercises.length} {t('common.exercises')}
                </Text>
                {item.exercises.length > 0 && (
                  <Text style={styles.routineCardExercisesList} numberOfLines={2}>
                    {item.exercises.map((ex: any) => (i18n.language === 'ja' ? ex.name_ja : ex.name_en) || ex.name || ex).join(', ')}
                  </Text>
                )}
              </View>
              <Icon name="chevron-forward" size={20} color={colors.dark.accent.primary} />
            </Pressable>
          )}
        />
      )}

      <CreateCustomMGModal
        visible={newWorkoutPicker.showCreateCustomMGModal}
        onRequestClose={() => newWorkoutPicker.setShowCreateCustomMGModal(false)}
        newMGNameJa={newWorkoutPicker.newMGNameJa}
        setNewMGNameJa={newWorkoutPicker.setNewMGNameJa}
        newMGNameEn={newWorkoutPicker.newMGNameEn}
        setNewMGNameEn={newWorkoutPicker.setNewMGNameEn}
        handleCreateCustomMuscleGroup={newWorkoutPicker.handleCreateCustomMuscleGroup}
        t={t}
      />

      <CreateCustomExerciseModal
        visible={newWorkoutPicker.showCreateCustomExerciseModal}
        onRequestClose={() => newWorkoutPicker.setShowCreateCustomExerciseModal(false)}
        newExNameJa={newWorkoutPicker.newExNameJa}
        setNewExNameJa={newWorkoutPicker.setNewExNameJa}
        newExNameEn={newWorkoutPicker.newExNameEn}
        setNewExNameEn={newWorkoutPicker.setNewExNameEn}
        newExMGId={newWorkoutPicker.newExMGId}
        setNewExMGId={newWorkoutPicker.setNewExMGId}
        allMuscleGroups={newWorkoutPicker.allMuscleGroups}
        selectedMuscleGroupId={newWorkoutPicker.selectedMuscleGroupId}
        handleCreateCustomExercise={newWorkoutPicker.handleCreateCustomExercise}
        t={t}
        i18n={i18n}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  header: {
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
  routineList: {
    padding: spacing.base,
    gap: spacing.sm,
  },
  routineCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  routineCardName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  routineCardDetails: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  routineCardExercisesList: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.xs,
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 16,
  },
  emptyText: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  formContainer: {
    padding: spacing.base,
    gap: spacing.xs,
  },
  modalInputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.dark.text.secondary,
  },
  modalTextInput: {
    height: 48,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.white,
    fontSize: typography.fontSize.md,
  },
  textInputError: {
    borderColor: colors.dark.accent.danger,
  },
  errorText: {
    color: colors.dark.accent.danger,
    fontSize: typography.fontSize.xs,
  },
  footer: {
    padding: spacing.base,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.primary,
  },
});
