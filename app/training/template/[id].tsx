import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Pressable, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { useWorkoutStore } from '@/store/workout.store';
import { useTranslation } from 'react-i18next';
import { AppErrorHandler, ValidationError, DatabaseError } from '@/lib/error-handler';
import { useExercisePicker } from '@/features/training/hooks/use-exercise-picker';
import { ExercisePicker } from '@/features/training/components/ExercisePicker';
import { CreateCustomMGModal } from '@/features/training/components/CreateCustomMGModal';
import { CreateCustomExerciseModal } from '@/features/training/components/CreateCustomExerciseModal';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';

export default function EditTemplateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { 
    workoutName, 
    exercises,
    savedWorkouts,
    setWorkoutName, 
    setExercises,
    removeExerciseFromWorkout,
    reorderExercises,
    updateSavedWorkout,
    deleteSavedWorkout,
    clearWorkoutBuilder
  } = useWorkoutStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPicking, setIsPicking] = useState(false);

  // We find the template once on mount
  const template = useMemo(() => savedWorkouts.find(w => w.id === id), [savedWorkouts, id]);
  
  // We grab the initial exercises to feed to the picker
  const initialSelectedIds = useMemo(() => {
    return template ? template.exercises.map((e: any) => e.id) : [];
  }, [template]);

  const picker = useExercisePicker(initialSelectedIds);

  useEffect(() => {
    if (template) {
      setWorkoutName(template.name);
      setExercises(template.exercises);
      picker.setSelectedExerciseIds(template.exercises.map((e: any) => e.id));
    } else {
      AppErrorHandler.handleError(new ValidationError(t('common.unknownError')));
      router.back();
    }
    setIsLoading(false);
    return () => {
      clearWorkoutBuilder();
    };
  }, [template]);

  const handleSave = async () => {
    if (!workoutName.trim()) {
      AppErrorHandler.handleError(new ValidationError(t('todayWorkout.nameEmpty')));
      return;
    }
    if (exercises.length === 0) {
      AppErrorHandler.handleError(new ValidationError(t('todayWorkout.exercisesRequired')));
      return;
    }

    setIsSaving(true);
    const result = await updateSavedWorkout(id as string, workoutName, exercises);
    setIsSaving(false);
    
    if (result.success) {
      router.back();
    } else {
      AppErrorHandler.handleError(new DatabaseError(t('todayWorkout.updateFailed')));
    }
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      t('todayWorkout.deleteTemplate'),
      t('todayWorkout.deleteTemplateConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            const res = await deleteSavedWorkout(id as string);
            if (res.success) {
              router.back();
            } else {
              AppErrorHandler.handleError(new DatabaseError(t('todayWorkout.deleteFailed')));
            }
          },
        },
      ]
    );
  };

  const handleFinishPicking = () => {
    const selectedRecords = picker.selectedExerciseIds.map(exId => {
      return picker.allExercises.find(e => e.id === exId);
    }).filter(Boolean);
    const existing = exercises.filter(e => picker.selectedExerciseIds.includes(e.id));
    const newRecords = selectedRecords.filter(r => !existing.find(e => e?.id === r?.id));
    setExercises([...existing, ...newRecords] as any[]);
    setIsPicking(false);
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
    const name = i18n.language === 'ja' ? item.name_ja : item.name_en;
    
    return (
      <ScaleDecorator>
        <Pressable 
          onLongPress={drag} 
          disabled={isActive}
          style={[styles.exerciseItem, isActive && styles.exerciseItemActive]}
        >
          <Icon name="menu" size={24} color={colors.dark.text.tertiary} />
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={1}>{name}</Text>
          </View>
          <Pressable 
            onPress={() => {
              removeExerciseFromWorkout(item.id);
              picker.handleToggleSelectExercise(item.id);
            }}
            hitSlop={10}
            style={styles.deleteButton}
          >
            <Icon name="trash-outline" size={20} color={colors.dark.accent.danger} />
          </Pressable>
        </Pressable>
      </ScaleDecorator>
    );
  };

  if (isLoading || !template) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.dark.accent.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.customHeader}>
          <Pressable
            onPress={() => {
              if (isPicking) setIsPicking(false);
              else router.back();
            }}
            hitSlop={8}
            style={styles.headerBackButton}
          >
            <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>{t('session.editWorkoutTemplate')}</Text>
          {!isPicking ? (
            <Pressable
              onPress={handleDeleteConfirm}
              hitSlop={8}
              style={styles.headerDeleteButton}
            >
              <Icon name="trash-outline" size={22} color={colors.dark.accent.danger} />
            </Pressable>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>

        {isPicking ? (
          <>
            <View style={{ flex: 1 }}>
              <ExercisePicker picker={picker} />
            </View>
            <View style={styles.footer}>
              <Button 
                label={t('common.done')} 
                fullWidth 
                onPress={handleFinishPicking}
              />
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
              <View style={styles.formContainer}>
                <Text style={styles.label}>{t('todayWorkout.workoutName')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={workoutName}
                  onChangeText={setWorkoutName}
                  placeholder={t('todayWorkout.placeholder')}
                  placeholderTextColor={colors.dark.text.tertiary}
                />
              </View>
            </TouchableWithoutFeedback>

            <View style={styles.listContainer}>
              <View style={styles.listHeader}>
                <Text style={styles.label}>{t('session.exercises')}</Text>
                <Pressable 
                  style={styles.addExerciseBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setIsPicking(true);
                  }}
                >
                  <Icon name="add" size={18} color={colors.dark.accent.primary} />
                  <Text style={styles.addExerciseText}>{t('session.addExercise')}</Text>
                </Pressable>
              </View>

              {exercises.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t('session.selectMuscleGroupView')}</Text>
                </View>
              ) : (
                <DraggableFlatList
                  data={exercises}
                  keyExtractor={(item) => item.id}
                  onDragEnd={({ from, to }) => reorderExercises(from, to)}
                  renderItem={renderItem}
                  contentContainerStyle={styles.listContent}
                  containerStyle={{ flex: 1 }}
                />
              )}
            </View>

            <View style={styles.footer}>
              <Button 
                label={isSaving ? t('common.saving') : t('common.save')} 
                fullWidth 
                onPress={handleSave}
                disabled={isSaving || exercises.length === 0}
              />
            </View>
          </View>
        )}

        {/* Picker Modals */}
        <CreateCustomMGModal
          visible={picker.showCreateCustomMGModal}
          onRequestClose={() => picker.setShowCreateCustomMGModal(false)}
          newMGNameJa={picker.newMGNameJa}
          setNewMGNameJa={picker.setNewMGNameJa}
          newMGNameEn={picker.newMGNameEn}
          setNewMGNameEn={picker.setNewMGNameEn}
          handleCreateCustomMuscleGroup={picker.handleCreateCustomMuscleGroup}
          t={t}
        />

        <CreateCustomExerciseModal
          visible={picker.showCreateCustomExerciseModal}
          onRequestClose={() => picker.setShowCreateCustomExerciseModal(false)}
          newExNameJa={picker.newExNameJa}
          setNewExNameJa={picker.setNewExNameJa}
          newExNameEn={picker.newExNameEn}
          setNewExNameEn={picker.setNewExNameEn}
          newExMGId={picker.newExMGId}
          setNewExMGId={picker.setNewExMGId}
          allMuscleGroups={picker.allMuscleGroups}
          selectedMuscleGroupId={picker.selectedMuscleGroupId}
          handleCreateCustomExercise={picker.handleCreateCustomExercise}
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
  headerDeleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  formContainer: {
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.dark.bg.primary,
  },
  label: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: colors.dark.bg.secondary,
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    padding: spacing.base,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.sm,
  },
  addExerciseText: {
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    gap: spacing.sm,
  },
  exerciseItemActive: {
    backgroundColor: colors.dark.bg.tertiary,
    borderColor: colors.dark.accent.primary,
    shadowColor: colors.dark.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.bg.tertiary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.bg.secondary,
    marginHorizontal: spacing.base,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  emptyText: {
    color: colors.dark.text.tertiary,
    fontSize: typography.fontSize.md,
  },
  footer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
  }
});
