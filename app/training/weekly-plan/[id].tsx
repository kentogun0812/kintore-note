import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, FlatList, TextInput, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useWeeklyPlanStore, WeeklyPlan } from '@/store/weekly-plan.store';
import { useWorkoutStore } from '@/store/workout.store';
import { useAuthStore } from '@/store/auth.store';
import { useTranslation } from 'react-i18next';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';
import { WorkoutTemplateRepository } from '@/infra/repositories/workout-template.repository';

const dangerousCharsRegex = /[<>"';\\\{\}\[\]]/;

export default function WeeklyPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { weeklyPlans, activateWeeklyPlan, assignTemplateToWeek, fetchPlanTemplates } = useWeeklyPlanStore();
  const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore();

  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [assignedTemplates, setAssignedTemplates] = useState<any[]>([]);
  const [isTemplateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const [isCreatingNewWorkout, setIsCreatingNewWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutNameError, setWorkoutNameError] = useState<string | null>(null);
  const [allExercises, setAllExercises] = useState<any[]>([]);

  useEffect(() => {
    if (isCreatingNewWorkout) {
      const userId = useAuthStore.getState().user?.id || 'guest';
      const exs = ExerciseRepository.getAllExercises(userId);
      setAllExercises(exs);
    }
  }, [isCreatingNewWorkout]);

  useEffect(() => {
    const p = weeklyPlans.find((prog) => prog.id === id);
    if (p) setPlan(p);
  }, [id, weeklyPlans]);

  useEffect(() => {
    if (id) {
      loadAssignedTemplates();
      fetchSavedWorkouts(); // Make sure we have routines to pick from
    }
  }, [id]);

  const loadAssignedTemplates = async () => {
    const templates = await fetchPlanTemplates(id);
    setAssignedTemplates(templates);
  };

  const handleOpenTemplatePicker = (week: number) => {
    setSelectedWeek(week);
    setTemplateModalVisible(true);
  };

  const filteredExercises = allExercises.filter(ex => {
    const name = i18n.language === 'ja' ? ex.name_ja : ex.name_en;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
        Alert.alert(
          t('todayWorkout.guestLimitTitle'),
          t('todayWorkout.guestLimitDesc')
        );
        return;
      }

      const selectedExercises = allExercises
        .filter(ex => selectedExerciseIds.includes(ex.id))
        .map(ex => ({
          id: ex.id,
          name: i18n.language === 'ja' ? ex.name_ja : ex.name_en
        }));

      const templateId = WorkoutTemplateRepository.saveWorkoutTemplate(userId, trimmedName, selectedExercises);
      await fetchSavedWorkouts();

      if (selectedWeek !== null && id) {
        await assignTemplateToWeek(id, templateId, selectedWeek);
        await loadAssignedTemplates();
      }

      setIsCreatingNewWorkout(false);
      setNewWorkoutName('');
      setSelectedExerciseIds([]);
      setSearchQuery('');
      setTemplateModalVisible(false);

      Alert.alert(t('common.success'), t('session.workoutSaved', 'Workout template created and assigned successfully.'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message);
    }
  };

  const handleSelectTemplate = async (templateId: string) => {
    if (selectedWeek !== null && id) {
      await assignTemplateToWeek(id, templateId, selectedWeek);
      await loadAssignedTemplates();
    }
    setTemplateModalVisible(false);
  };

  const handleActivate = async () => {
    if (id) {
      await activateWeeklyPlan(id);
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
      </View>
    );
  }

  // Generate weeks array
  const weeks = Array.from({ length: plan.total_weeks }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: plan.name,
          headerLargeTitle: false,
          headerBackVisible: true,
        }} 
      />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Text style={styles.weeklyPlanName}>{plan.name}</Text>
            {plan.is_active && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{t('weeklyPlan.active', 'Active')}</Text>
              </View>
            )}
          </View>
          <Text style={styles.weeklyPlanDetails}>
            {plan.total_weeks} {t('weeklyPlan.weeks', 'Weeks')}
            {plan.start_date ? ` • Starts: ${plan.start_date}` : ''}
          </Text>
          
          {!plan.is_active && (
            <Button 
              label={t('weeklyPlan.setAsActive', 'Set as Active Plan')} 
              variant="secondary" 
              size="sm"
              onPress={handleActivate}
              style={styles.activateButton}
            />
          )}
        </Card>

        <Text style={styles.sectionTitle}>{t('weeklyPlan.timeline', 'Schedule Timeline')}</Text>

        <View style={styles.timeline}>
          {weeks.map((week) => {
            // Find if a template is assigned to this week
            const templateForWeek = assignedTemplates.find(m => m.plan_week === week);

            return (
              <View key={week} style={styles.weekRow}>
                <View style={styles.weekIndicator}>
                  <View style={styles.weekCircle}>
                    <Text style={styles.weekNumber}>{week}</Text>
                  </View>
                  {week !== plan.total_weeks && <View style={styles.weekLine} />}
                </View>
                
                <Card style={styles.weekCard}>
                  <Text style={styles.weekTitle}>{t('weeklyPlan.weekN', { n: week, defaultValue: `Week ${week}` })}</Text>
                  
                  {templateForWeek ? (
                    <View style={styles.assignedRoutine}>
                      <Icon name="document-text-outline" size={20} color={colors.dark.accent.primary} />
                      <Text style={styles.routineName}>{templateForWeek.name}</Text>
                      <Pressable onPress={() => handleOpenTemplatePicker(week)} hitSlop={8}>
                        <Icon name="swap-horizontal" size={20} color={colors.dark.text.tertiary} />
                      </Pressable>
                    </View>
                  ) : (
                    <Button 
                      label={t('weeklyPlan.assignWorkout')} 
                      variant="outline" 
                      size="sm"
                      iconName="add"
                      onPress={() => handleOpenTemplatePicker(week)}
                    />
                  )}
                </Card>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Template Picker Modal */}
      <Modal 
        visible={isTemplateModalVisible} 
        animationType="slide" 
        presentationStyle="pageSheet" 
        onRequestClose={() => {
          setTemplateModalVisible(false);
          setIsCreatingNewWorkout(false);
        }}
      >
        <View style={styles.modalContainer}>
          {isCreatingNewWorkout ? (
            <View style={{ flex: 1, padding: spacing.md, gap: spacing.md }}>
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={() => {
                    setIsCreatingNewWorkout(false);
                    setNewWorkoutName('');
                    setSelectedExerciseIds([]);
                    setSearchQuery('');
                  }} 
                  hitSlop={8}
                >
                  <Icon name="arrow-back" size={24} color={colors.dark.text.primary} />
                </Pressable>
                <Text style={styles.modalTitle}>{t('weeklyPlan.createNewWorkout', 'Create Workout')}</Text>
                <View style={{ width: 24 }} />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('todayWorkout.workoutName', 'Workout Name')}</Text>
                <TextInput
                  value={newWorkoutName}
                  onChangeText={(text) => {
                    setNewWorkoutName(text);
                    setWorkoutNameError(null);
                  }}
                  placeholder={t('todayWorkout.placeholder', 'e.g. Chest & Shoulders')}
                  placeholderTextColor={colors.dark.text.tertiary}
                  style={[styles.textInput, workoutNameError ? styles.textInputError : null]}
                />
                {workoutNameError ? <Text style={styles.errorText}>{workoutNameError}</Text> : null}
              </View>

              <Text style={styles.sectionTitle}>{t('todayWorkout.exercises', 'Exercises')}</Text>
              
              <View style={styles.searchBar}>
                <Icon name="search" size={16} color={colors.dark.text.secondary} />
                <TextInput
                  placeholder={t('library.searchPlaceholder', 'Search exercises...')}
                  placeholderTextColor={colors.dark.text.secondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                />
              </View>

              <FlatList
                data={filteredExercises}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isChecked = selectedExerciseIds.includes(item.id);
                  const name = i18n.language === 'ja' ? item.name_ja : item.name_en;
                  return (
                    <Pressable
                      style={[styles.exerciseSelectCard, isChecked && styles.exerciseSelectCardChecked]}
                      onPress={() => {
                        if (isChecked) {
                          setSelectedExerciseIds(selectedExerciseIds.filter(id => id !== item.id));
                        } else {
                          setSelectedExerciseIds([...selectedExerciseIds, item.id]);
                        }
                      }}
                    >
                      <Text style={styles.exerciseSelectName}>{name}</Text>
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Icon name="checkmark" size={12} color={colors.white} />}
                      </View>
                    </Pressable>
                  );
                }}
                contentContainerStyle={styles.exerciseSelectList}
                style={{ flex: 1 }}
              />

              <View style={styles.creatorFooter}>
                <Button
                  label={t('common.save')}
                  fullWidth
                  disabled={!newWorkoutName.trim() || selectedExerciseIds.length === 0}
                  onPress={handleSaveNewWorkoutTemplate}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('weeklyPlan.selectWorkout')}</Text>
                <Pressable onPress={() => setTemplateModalVisible(false)} hitSlop={8}>
                  <Icon name="close" size={28} color={colors.dark.text.primary} />
                </Pressable>
              </View>
              
              <FlatList 
                data={savedWorkouts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.routineList}
                ListHeaderComponent={
                  <Button
                    label={t('weeklyPlan.createNewWorkout', 'Create New Workout')}
                    iconName="add-circle"
                    variant="outline"
                    style={{ marginBottom: spacing.md }}
                    onPress={() => setIsCreatingNewWorkout(true)}
                  />
                }
                ListEmptyComponent={
                  <Text style={styles.emptyText}>{t('weeklyPlan.noSavedWorkouts')}</Text>
                }
                renderItem={({ item }) => (
                  <Pressable style={styles.routineItem} onPress={() => handleSelectTemplate(item.id)}>
                    <Text style={styles.routineItemName}>{item.name}</Text>
                    <Icon name="chevron-forward" size={20} color={colors.dark.text.tertiary} />
                  </Pressable>
                )}
              />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  loadingText: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl * 2,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  headerCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyPlanName: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
    flex: 1,
  },
  activeBadge: {
    backgroundColor: colors.dark.accent.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary,
  },
  activeBadgeText: {
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  weeklyPlanDetails: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  activateButton: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  timeline: {
    gap: 0,
  },
  weekRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  weekIndicator: {
    width: 40,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  weekCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark.bg.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.dark.border.default,
    zIndex: 2,
  },
  weekNumber: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
  },
  weekLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.dark.border.default,
    marginVertical: -2, // slight overlap
    zIndex: 1,
  },
  weekCard: {
    flex: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
    justifyContent: 'center',
  },
  weekTitle: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  assignedRoutine: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.sm,
  },
  routineName: {
    flex: 1,
    color: colors.dark.text.primary,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg.secondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  routineList: {
    padding: spacing.base,
  },
  routineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  routineItemName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
  },
  emptyText: {
    color: colors.dark.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  inputGroup: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.dark.text.secondary,
  },
  textInput: {
    height: 40,
    backgroundColor: colors.dark.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    color: colors.white,
    fontSize: typography.fontSize.base,
  },
  textInputError: {
    borderColor: '#E54D42',
  },
  errorText: {
    color: '#E54D42',
    fontSize: typography.fontSize.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.base,
    height: '100%',
  },
  exerciseSelectList: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  exerciseSelectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
  },
  exerciseSelectCardChecked: {
    borderColor: colors.dark.accent.primary,
  },
  exerciseSelectName: {
    color: colors.dark.text.primary,
    fontWeight: '600',
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.dark.accent.primary,
    borderColor: colors.dark.accent.primary,
  },
  creatorFooter: {
    marginTop: spacing.xs,
  },
});
