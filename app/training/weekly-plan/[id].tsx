import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, FlatList, TextInput, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
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
import { WorkoutTemplateRepository } from '@/infra/repositories/workout-template.repository';
import { useExercisePicker } from '@/features/training/hooks/use-exercise-picker';
import { ExercisePicker } from '@/features/training/components/ExercisePicker';
import { CreateCustomMGModal } from '@/features/training/components/CreateCustomMGModal';
import { CreateCustomExerciseModal } from '@/features/training/components/CreateCustomExerciseModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HankoCalendar } from '@/components/HankoCalendar';
import DateTimePicker from '@react-native-community/datetimepicker';

const dangerousCharsRegex = /[<>"';\\\{\}\[\]]/;

export default function WeeklyPlanDetailScreen() {
  const { id, isNew } = useLocalSearchParams<{ id: string, isNew?: string }>();
  const { t, i18n } = useTranslation();
  const { weeklyPlans, activateWeeklyPlan, assignToDay, fetchPlanTemplates, deleteWeeklyPlan, updateWeeklyPlan } = useWeeklyPlanStore();
  const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore();

  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [assignedTemplates, setAssignedTemplates] = useState<any[]>([]);
  const [isTemplateModalVisible, setTemplateModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [isCreatingNewWorkout, setIsCreatingNewWorkout] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [workoutNameError, setWorkoutNameError] = useState<string | null>(null);

  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanWeeks, setEditPlanWeeks] = useState('');
  const [editPlanStartDate, setEditPlanStartDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const [isDraft, setIsDraft] = useState(isNew === 'true');
  const isDraftRef = useRef(isDraft);

  useEffect(() => {
    isDraftRef.current = isDraft;
  }, [isDraft]);

  useEffect(() => {
    return () => {
      if (isDraftRef.current && id) {
        deleteWeeklyPlan(id);
      }
    };
  }, [id]);

  const newWorkoutPicker = useExercisePicker([]);

  useEffect(() => {
    const p = weeklyPlans.find((prog) => prog.id === id);
    if (p) {
      setPlan(p);
      setEditPlanName(p.name);
      setEditPlanWeeks(p.total_weeks.toString());
      setEditPlanStartDate(p.start_date || '');
    }
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

  const handleOpenTemplatePicker = (week: number, day: number) => {
    setSelectedWeek(week);
    setSelectedDay(day);
    setTemplateModalVisible(true);
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    
    const trimmedName = editPlanName.trim();
    if (!trimmedName) {
      setEditPlanName(plan.name); // revert
      Alert.alert(t('common.error'), t('weeklyPlanBuilder.nameRequired', 'Name is required'));
      return;
    }
    
    const weeksNum = parseInt(editPlanWeeks, 10);
    if (isNaN(weeksNum) || weeksNum < 1 || weeksNum > 52) {
      setEditPlanWeeks(plan.total_weeks.toString()); // revert
      Alert.alert(t('common.error'), t('weeklyPlanBuilder.invalidWeeks', 'Weeks must be between 1 and 52'));
      return;
    }

    try {
      if (trimmedName !== plan.name || weeksNum !== plan.total_weeks || editPlanStartDate !== (plan.start_date || '')) {
        await updateWeeklyPlan(plan.id, trimmedName, weeksNum, editPlanStartDate || undefined);
      }
      isDraftRef.current = false;
      setIsDraft(false);
      router.back();
    } catch (err: any) {
      Alert.alert(t('common.error'), 'Failed to save changes');
      setEditPlanName(plan.name);
      setEditPlanWeeks(plan.total_weeks.toString());
      setEditPlanStartDate(plan.start_date || '');
    }
  };

  const handleDeletePlan = () => {
    Alert.alert(
      t('weeklyPlan.deletePlan', 'Delete Plan'),
      t('weeklyPlan.deletePlanConfirm', 'Are you sure you want to delete this weekly plan?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        { 
          text: t('common.delete', 'Delete'), 
          style: 'destructive',
          onPress: async () => {
            if (id) {
               await deleteWeeklyPlan(id);
               isDraftRef.current = false;
               router.back();
            }
          }
        }
      ]
    );
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
        Alert.alert(
          t('todayWorkout.guestLimitTitle'),
          t('todayWorkout.guestLimitDesc')
        );
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

      if (selectedWeek !== null && selectedDay !== null && id) {
        await assignToDay(id, templateId, selectedWeek, selectedDay, false);
        await loadAssignedTemplates();
      }

      setIsCreatingNewWorkout(false);
      setNewWorkoutName('');
      newWorkoutPicker.setSelectedExerciseIds([]);
      setTemplateModalVisible(false);

      Alert.alert(t('common.success'), t('session.workoutSaved', 'Workout template created and assigned successfully.'));
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message);
    }
  };

  const handleSelectTemplate = async (templateId: string | null, isRestDay: boolean = false) => {
    if (selectedWeek !== null && selectedDay !== null && id) {
      await assignToDay(id, templateId, selectedWeek, selectedDay, isRestDay);
      await loadAssignedTemplates();
    }
    setTemplateModalVisible(false);
  };

  const handleSelectRestDay = () => handleSelectTemplate(null, true);

  const handleActivate = async () => {
    if (id) {
      await activateWeeklyPlan(id);
    }
  };

  if (!plan) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading', 'Loading...')}</Text>
      </SafeAreaView>
    );
  }

  // Generate weeks array
  const weeks = Array.from({ length: plan.total_weeks }, (_, i) => i + 1);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: plan.name,
          headerLargeTitle: false,
          headerBackVisible: true,
          headerShown: false, // Use custom header for consistent style
        }} 
      />

      <View style={styles.customHeader}>
        <Pressable 
          onPress={() => {
            if (isDraft) {
              deleteWeeklyPlan(id);
              isDraftRef.current = false;
            }
            router.back();
          }} 
          hitSlop={8} 
          style={styles.headerBackButton}
        >
          <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{isNew ? t('weeklyPlan.addWeeklyPlan') : t('weeklyPlan.editWeeklyPlan')}</Text>
        {!isNew ? (
          <Pressable 
            onPress={handleDeletePlan} 
            hitSlop={8} 
            style={styles.headerActionButton}
          >
            <Icon name="trash-outline" size={24} color={colors.dark.accent.danger} />
          </Pressable>
        ) : (
          <View style={styles.headerActionButton} />
        )}
      </View>
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.detailsHeader, { justifyContent: 'flex-end' }]}>
          {plan.is_active ? (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{t('weeklyPlan.active', 'Active')}</Text>
            </View>
          ) : (
            <Button 
              label={t('weeklyPlan.setAsActive', 'Set Active')} 
              variant="outline" 
              size="sm"
              onPress={handleActivate}
            />
          )}
        </View>

        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('weeklyPlanBuilder.name', 'Weekly Plan Name')}
            </Text>
            <TextInput 
              value={editPlanName}
              onChangeText={setEditPlanName}
              placeholder={t('weeklyPlanBuilder.namePlaceholder', 'e.g. 4-Week Strength Block')}
              placeholderTextColor={colors.dark.text.tertiary}
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('weeklyPlanBuilder.totalWeeks', 'Total Weeks (1-52)')}
            </Text>
            <TextInput 
              value={editPlanWeeks}
              onChangeText={setEditPlanWeeks}
              placeholder="4"
              keyboardType="number-pad"
              placeholderTextColor={colors.dark.text.tertiary}
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('weeklyPlanBuilder.startDate', 'Start Date')}
            </Text>
            <Pressable onPress={() => {
              setShowDatePicker(true);
              setCalendarDate(editPlanStartDate ? new Date(editPlanStartDate + 'T00:00:00') : new Date());
            }} style={[styles.textInput, { justifyContent: 'center' }]}>
              <Text style={{ color: editPlanStartDate ? colors.dark.text.primary : colors.dark.text.tertiary, fontSize: typography.fontSize.md }}>
                {editPlanStartDate || new Date().toISOString().split('T')[0]}
              </Text>
            </Pressable>
            
            {showDatePicker && (
              <Modal visible={showDatePicker} transparent animationType="fade">
                <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }} onPress={() => setShowDatePicker(false)}>
                  <Pressable style={{ backgroundColor: colors.dark.bg.elevated, padding: spacing.md, borderRadius: radius.xl, width: '90%', maxWidth: 400 }} onPress={e => e.stopPropagation()}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                      <Pressable onPress={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} hitSlop={12} style={{ padding: spacing.sm }}>
                        <Icon name="chevron-back" size={20} color={colors.dark.text.secondary} />
                      </Pressable>
                      <Text style={{ color: colors.dark.text.primary, fontSize: typography.fontSize.md, fontWeight: 'bold' }}>
                        {calendarDate.toLocaleString(i18n.language, { year: 'numeric', month: 'long' })}
                      </Text>
                      <Pressable onPress={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} hitSlop={12} style={{ padding: spacing.sm }}>
                        <Icon name="chevron-forward" size={20} color={colors.dark.text.secondary} />
                      </Pressable>
                    </View>
                    <HankoCalendar
                      year={calendarDate.getFullYear()}
                      month={calendarDate.getMonth() + 1}
                      stampedDates={[]}
                      selectedDate={editPlanStartDate || undefined}
                      onDatePress={async (dateString) => {
                        setEditPlanStartDate(dateString);
                        setShowDatePicker(false);
                        if (plan && dateString !== (plan.start_date || '')) {
                          // Allow explicit save to commit the change
                        }
                      }}
                    />
                  </Pressable>
                </Pressable>
              </Modal>
            )}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>{t('weeklyPlan.timeline', 'Schedule Timeline')}</Text>

        <View style={styles.timeline}>
          {weeks.map((week) => {
            const templatesForWeek = assignedTemplates.filter(m => m.plan_week === week);

            return (
              <View key={week} style={styles.weekRow}>
                <View style={styles.weekIndicator}>
                  <View style={[styles.weekCircle, templatesForWeek.length > 0 && styles.weekCircleActive]}>
                    <Text style={styles.weekNumber}>{week}</Text>
                  </View>
                  {week !== plan.total_weeks && <View style={styles.weekLine} />}
                </View>
                
                <Card style={styles.weekCard}>
                  <Text style={styles.weekTitle}>{t('weeklyPlan.weekN', { n: week, defaultValue: `Week ${week}` })}</Text>
                  
                  <View style={{ gap: spacing.sm }}>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => {
                      const assignedTemplate = assignedTemplates.find(m => m.plan_week === week && m.day_of_week === day);
                      return (
                        <View key={day} style={styles.dayRow}>
                          <Text style={styles.dayLabel}>{t('weeklyPlan.dayN', { n: day, defaultValue: `Day ${day}` })}</Text>
                          <View style={{ flex: 1 }}>
                            {assignedTemplate ? (
                              assignedTemplate.is_rest_day ? (
                                <View style={[styles.assignedRoutine, { backgroundColor: colors.dark.bg.tertiary, borderColor: 'transparent' }]}>
                                  <Icon name="cafe-outline" size={20} color={colors.dark.text.secondary} />
                                  <Text style={[styles.routineName, { color: colors.dark.text.secondary }]}>{t('weeklyPlan.restDay', 'Rest Day')}</Text>
                                  <Pressable onPress={() => handleOpenTemplatePicker(week, day)} hitSlop={8}>
                                    <Icon name="swap-horizontal" size={20} color={colors.dark.text.tertiary} />
                                  </Pressable>
                                </View>
                              ) : (
                                <View style={styles.assignedRoutine}>
                                  <Icon name="document-text-outline" size={20} color={colors.dark.accent.primary} />
                                  <Text style={styles.routineName} numberOfLines={1}>{assignedTemplate.name}</Text>
                                  <Pressable onPress={() => handleOpenTemplatePicker(week, day)} hitSlop={8}>
                                    <Icon name="swap-horizontal" size={20} color={colors.dark.text.tertiary} />
                                  </Pressable>
                                </View>
                              )
                            ) : (
                              <Button 
                                label={t('weeklyPlan.assignWorkout')} 
                                variant="outline" 
                                size="sm"
                                iconName="add"
                                onPress={() => handleOpenTemplatePicker(week, day)}
                                style={{ paddingVertical: 8 }}
                                textStyle={{ fontSize: 13 }}
                              />
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </Card>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label={t('common.save', 'Save Plan')} 
          fullWidth 
          disabled={!editPlanName.trim() || !editPlanWeeks.trim()}
          onPress={handleSavePlan} 
        />
      </View>

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
        <SafeAreaView edges={['top']} style={styles.modalContainer}>
          {isCreatingNewWorkout ? (
            <KeyboardAvoidingView 
              style={{ flex: 1 }} 
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.modalHeader}>
                <Pressable 
                  onPress={() => {
                    setIsCreatingNewWorkout(false);
                    setNewWorkoutName('');
                    newWorkoutPicker.setSelectedExerciseIds([]);
                  }} 
                  hitSlop={8}
                >
                  <Icon name="arrow-back" size={24} color={colors.dark.text.primary} />
                </Pressable>
                <Text style={styles.modalTitle}>{t('weeklyPlan.createNewWorkout', 'Create Workout')}</Text>
                <View style={{ width: 24 }} />
              </View>

              <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.formContainer, { paddingBottom: 0 }]}>
                  <Text style={styles.modalInputLabel}>{t('todayWorkout.workoutName', 'Workout Name')}</Text>
                  <TextInput
                    value={newWorkoutName}
                    onChangeText={(text) => {
                      setNewWorkoutName(text);
                      setWorkoutNameError(null);
                    }}
                    placeholder={t('todayWorkout.placeholder', 'e.g. Chest & Shoulders')}
                    placeholderTextColor={colors.dark.text.tertiary}
                    style={[styles.modalTextInput, workoutNameError ? styles.textInputError : null]}
                  />
                  {workoutNameError ? <Text style={styles.errorText}>{workoutNameError}</Text> : null}
                </View>
              </TouchableWithoutFeedback>

              {/* Embedded Reusable Exercise Picker */}
              <View style={{ flex: 1 }}>
                <ExercisePicker picker={newWorkoutPicker} />
              </View>

              <View style={styles.modalFooter}>
                <Button
                  label={t('common.save')}
                  fullWidth
                  disabled={!newWorkoutName.trim() || newWorkoutPicker.selectedExerciseIds.length === 0}
                  onPress={handleSaveNewWorkoutTemplate}
                />
              </View>
            </KeyboardAvoidingView>
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
                  <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                    <Button
                      label={t('weeklyPlan.createNewWorkout', 'Create New Workout')}
                      iconName="add-circle"
                      variant="outline"
                      onPress={() => setIsCreatingNewWorkout(true)}
                    />
                    <Button
                      label={t('weeklyPlan.markAsRestDay', 'Mark as Rest Day')}
                      iconName="cafe-outline"
                      variant="secondary"
                      onPress={handleSelectRestDay}
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
                    </View>
                    <Icon name="chevron-forward" size={20} color={colors.dark.accent.primary} />
                  </Pressable>
                )}
              />
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* Reusable Exercise Picker Modals */}
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
  headerActionButton: {
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
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  formCard: {
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: colors.dark.bg.tertiary,
    color: colors.dark.text.primary,
    paddingHorizontal: spacing.md,
    height: 48,
    justifyContent: 'center',
    borderRadius: radius.md,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  footer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.primary,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
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
    color: colors.dark.accent.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  weeklyPlanDetails: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  activateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.accent.primary + '30',
    gap: spacing.md,
  },
  activateBannerTitle: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  activateBannerDesc: {
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
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
  weekCircleActive: {
    borderColor: colors.dark.accent.primary,
    backgroundColor: colors.dark.accent.primary + '10',
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
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    gap: spacing.sm,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayLabel: {
    width: 48,
    color: colors.dark.text.secondary,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  routineName: {
    flex: 1,
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
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
  modalFooter: {
    padding: spacing.base,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.primary,
  },
});
