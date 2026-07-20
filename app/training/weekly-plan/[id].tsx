import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal, TextInput, Alert, Platform, ToastAndroid, Animated } from 'react-native';
import { Stack, router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useWeeklyPlanStore, WeeklyPlan } from '@/store/weekly-plan.store';
import { useWorkoutStore } from '@/store/workout.store';
import { AppErrorHandler, ValidationError } from '@/lib/error-handler';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HankoCalendar } from '@/components/HankoCalendar';
import { ExerciseRepository } from '@/infra/repositories/exercise.repository';

const dangerousCharsRegex = /[<>"';\\\{\}\[\]]/;

export default function WeeklyPlanDetailScreen() {
  const { id, isNew } = useLocalSearchParams<{ id: string, isNew?: string }>();
  const { t, i18n } = useTranslation();
  const { weeklyPlans, activateWeeklyPlan, deactivateWeeklyPlan, assignToDay, fetchPlanTemplates, deleteWeeklyPlan, updateWeeklyPlan, applyPresetTemplate } = useWeeklyPlanStore();
  const { savedWorkouts, fetchSavedWorkouts } = useWorkoutStore();
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [assignedTemplates, setAssignedTemplates] = useState<any[]>([]);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanWeeks, setEditPlanWeeks] = useState('');
  const [editPlanStartDate, setEditPlanStartDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [isDraft, setIsDraft] = useState(isNew === 'true');
  const isDraftRef = useRef(isDraft);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [exercisesList, setExercisesList] = useState<any[]>([]);
  const [switchWidth, setSwitchWidth] = useState(0);
  const isActive = plan?.is_active || false;
  const switchAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: isActive ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive, switchWidth]);

  useEffect(() => {
    const list = ExerciseRepository.getAllExercises();
    setExercisesList(list);
  }, []);

  const getExerciseName = (exId: string) => {
    const ex = exercisesList.find(e => e.id === exId);
    if (!ex) return exId;
    return i18n.language === 'ja' ? ex.name_ja : ex.name_en;
  };

  const handleClearDay = async (week: number, day: number) => {
    if (id) {
      await assignToDay(id, null, week, day, false);
      await loadAssignedTemplates();
    }
  };

  const handleAssignRestDay = async (week: number, day: number) => {
    if (id) {
      await assignToDay(id, null, week, day, true);
      await loadAssignedTemplates();
    }
  };

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

  useEffect(() => {
    const p = weeklyPlans.find((prog) => prog.id === id);
    if (p) {
      setPlan(p);
      setEditPlanName(p.name);
      setEditPlanWeeks(p.total_weeks > 0 ? p.total_weeks.toString() : '1');
      setEditPlanStartDate(p.start_date || '');
    }
  }, [id, weeklyPlans]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadAssignedTemplates();
        fetchSavedWorkouts();
      }
    }, [id])
  );

  const loadAssignedTemplates = async () => {
    const templates = await fetchPlanTemplates(id);
    setAssignedTemplates(templates);
  };

  const handleOpenTemplatePicker = (week: number, day: number) => {
    router.push({
      pathname: '/training/weekly-plan/select-workout',
      params: { planId: id, week: week.toString(), day: day.toString() }
    });
  };

  const handleSavePlan = async () => {
    if (!plan) return;
    
    const trimmedName = editPlanName.trim();
    if (!trimmedName) {
      setEditPlanName(plan.name);
      AppErrorHandler.handleError(new ValidationError(t('weeklyPlanBuilder.nameRequired'), 'NAME_REQUIRED'));
      return;
    }
    
    const weeksNum = parseInt(editPlanWeeks, 10);
    if (isNaN(weeksNum) || weeksNum < 1 || weeksNum > 52) {
      setEditPlanWeeks(plan.total_weeks.toString());
      AppErrorHandler.handleError(new ValidationError(t('weeklyPlanBuilder.invalidWeeks'), 'INVALID_WEEKS'));
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
      AppErrorHandler.handleError(err);
      setEditPlanName(plan.name);
      setEditPlanWeeks(plan.total_weeks.toString());
      setEditPlanStartDate(plan.start_date || '');
    }
  };

  const handleDeletePlan = () => {
    Alert.alert(
      t('weeklyPlan.deletePlan'),
      t('weeklyPlan.deletePlanConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.delete'), 
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

  const handleActivate = async () => {
    if (id) {
      await activateWeeklyPlan(id);
    }
  };

  if (!plan) {
    return (
      <SafeAreaView edges={['top']} style={styles.container}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  // Generate weeks array dynamically from the input state
  const weeksNum = parseInt(editPlanWeeks, 10);
  const weeks = !isNaN(weeksNum) && weeksNum >= 1 && weeksNum <= 52 
    ? Array.from({ length: weeksNum }, (_, i) => i + 1)
    : [];

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: plan.name,
          headerLargeTitle: false,
          headerBackVisible: true,
          headerShown: false, 
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
        <Pressable 
          style={styles.presetButton} 
          onPress={() => {
            router.push({
              pathname: '/training/weekly-plan/preset-templates',
              params: { planId: id }
            });
          }}
        >
          <Icon name="barbell-outline" size={20} color={colors.dark.accent.primary} />
          <Text style={styles.presetButtonText}>{t('weeklyPlan.suggestTemplatesButton')}</Text>
        </Pressable>

        <Card style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('weeklyPlanBuilder.name')}
            </Text>
            <TextInput 
              value={editPlanName}
              onChangeText={setEditPlanName}
              placeholder={t('weeklyPlanBuilder.namePlaceholder')}
              placeholderTextColor={colors.dark.text.tertiary}
              style={styles.textInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {t('weeklyPlanBuilder.totalWeeks')}
            </Text>
            <TextInput 
              value={editPlanWeeks}
              onChangeText={setEditPlanWeeks}
              placeholder={t('weeklyPlanBuilder.weeksPlaceholder', 'e.g. 4')}
              keyboardType="number-pad"
              placeholderTextColor={colors.dark.text.tertiary}
              style={styles.textInput}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.inputLabel}>
                {t('weeklyPlanBuilder.startDate')}
              </Text>
              <Pressable onPress={() => {
                setShowDatePicker(true);
                setCalendarDate(editPlanStartDate ? new Date(editPlanStartDate + 'T00:00:00') : new Date());
              }} style={[styles.textInput, { justifyContent: 'center' }]}>
                <Text style={{ color: editPlanStartDate ? colors.dark.text.primary : colors.dark.text.tertiary, fontSize: typography.fontSize.md }}>
                  {editPlanStartDate || t('weeklyPlanBuilder.datePlaceholder', 'YYYY-MM-DD')}
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
                          if (plan && dateString !== (plan.start_date || '')) {}
                        }}
                      />
                    </Pressable>
                  </Pressable>
                </Modal>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: 'right' }]}>
                {t('weeklyPlan.setAsActive')}
              </Text>
              <View style={{ height: 48, justifyContent: 'center' }}>
                <Pressable 
                  onPress={async () => {
                    if (!plan) return;
                    if (plan.is_active) {
                      await deactivateWeeklyPlan(plan.id);
                    } else {
                      await activateWeeklyPlan(plan.id);
                    }
                  }}
                  style={{
                    height: 28,
                    width: '100%',
                    borderRadius: 14,
                    backgroundColor: colors.dark.border.subtle,
                    padding: 2,
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                  onLayout={(e) => setSwitchWidth(e.nativeEvent.layout.width)}
                >
                  <Animated.View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: colors.dark.accent.primary,
                    opacity: switchAnim,
                  }} />
                  <Animated.View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: colors.white,
                    transform: [{ 
                      translateX: switchAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [2, Math.max(2, switchWidth - 26)]
                      })
                    }],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.2,
                    shadowRadius: 1.41,
                    elevation: 2,
                  }} />
                </Pressable>
              </View>
            </View>
          </View>
        </Card>



        <Text style={styles.sectionTitle}>{t('weeklyPlan.timeline')}</Text>

        <View style={styles.timeline}>
          {weeks.map((week) => {
            const templatesForWeek = assignedTemplates.filter(m => m.plan_week === week);
            const workoutCount = templatesForWeek.filter(m => !m.is_rest_day).length;
            const restCount = templatesForWeek.filter(m => m.is_rest_day).length;
            const isExpanded = expandedWeek === week;

            return (
              <Card key={week} style={[styles.weekAccordionCard, isExpanded && styles.weekAccordionCardExpanded]}>
                <Pressable 
                  onPress={() => setExpandedWeek(isExpanded ? null : week)}
                  style={styles.accordionHeader}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accordionTitle}>
                      {t('weeklyPlan.weekN', { n: week, defaultValue: `Week ${week}` })}
                    </Text>
                    <Text style={styles.accordionSubtitle}>
                      {t('weeklyPlan.weekSummary', { 
                        workoutCount, 
                        restCount, 
                        defaultValue: `${workoutCount} workouts, ${restCount} rest`
                      })}
                    </Text>
                  </View>
                  <Icon 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={colors.dark.text.secondary} 
                  />
                </Pressable>

                {isExpanded && (
                  <View style={styles.accordionContent}>
                    <View style={styles.accordionDivider} />
                    <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
                      {[1, 2, 3, 4, 5, 6, 7].map(day => {
                        const assignedTemplate = assignedTemplates.find(m => m.plan_week === week && m.day_of_week === day);
                        return (
                          <View key={day} style={styles.dayRow}>
                            <Text style={styles.dayLabel}>{t('weeklyPlan.dayN', { n: day, defaultValue: `Day ${day}` })}</Text>
                            <View style={{ flex: 1 }}>
                              {assignedTemplate ? (
                                <View style={[
                                  styles.assignedRoutine, 
                                  assignedTemplate.is_rest_day && { backgroundColor: colors.dark.bg.tertiary, borderColor: 'transparent' }
                                ]}>
                                  <View style={styles.routineInfoContainer}>
                                    <Icon 
                                      name={assignedTemplate.is_rest_day ? "bed-outline" : "document-text-outline"} 
                                      size={18} 
                                      color={assignedTemplate.is_rest_day ? colors.dark.text.secondary : colors.dark.accent.primary} 
                                    />
                                    <Text 
                                      style={[
                                        styles.routineName, 
                                        assignedTemplate.is_rest_day && { color: colors.dark.text.secondary }
                                      ]} 
                                      numberOfLines={1}
                                    >
                                      {assignedTemplate.is_rest_day ? t('weeklyPlan.restDay') : assignedTemplate.name}
                                    </Text>
                                  </View>
                                  <View style={styles.actionButtons}>
                                    <Pressable onPress={() => handleOpenTemplatePicker(week, day)} hitSlop={8} style={styles.actionButtonIcon}>
                                      <Icon name="swap-horizontal" size={18} color={colors.dark.text.secondary} />
                                    </Pressable>
                                    <Pressable onPress={() => handleClearDay(week, day)} hitSlop={8} style={styles.actionButtonIcon}>
                                      <Icon name="trash-outline" size={18} color={colors.dark.accent.danger} />
                                    </Pressable>
                                  </View>
                                </View>
                              ) : (
                                <View style={styles.unassignedContainer}>
                                  <Button 
                                    label={t('weeklyPlan.assignWorkout')} 
                                    variant="outline" 
                                    size="sm"
                                    iconName="add"
                                    onPress={() => handleOpenTemplatePicker(week, day)}
                                    style={styles.unassignedButton}
                                    textStyle={{ fontSize: 12 }}
                                  />
                                  <Button 
                                    label={t('weeklyPlan.restDay')} 
                                    variant="outline" 
                                    size="sm"
                                    iconName="bed-outline"
                                    onPress={() => handleAssignRestDay(week, day)}
                                    style={styles.unassignedRestButton}
                                    textStyle={{ fontSize: 12 }}
                                  />
                                </View>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          label={t('common.save')} 
          fullWidth 
          disabled={!editPlanName.trim() || !editPlanWeeks.trim()}
          onPress={handleSavePlan} 
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
    gap: spacing.md,
  },
  weekAccordionCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    borderRadius: radius.md,
    overflow: 'hidden',
    padding: 0,
  },
  weekAccordionCardExpanded: {
    borderColor: colors.dark.accent.primary + '50',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.dark.bg.secondary,
  },
  accordionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  accordionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.dark.text.secondary,
    marginTop: 2,
  },
  accordionContent: {
    padding: spacing.md,
    paddingTop: 0,
    backgroundColor: colors.dark.bg.secondary,
  },
  accordionDivider: {
    height: 1,
    backgroundColor: colors.dark.border.subtle,
    marginBottom: spacing.sm,
  },
  routineInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButtonIcon: {
    padding: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.bg.primary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
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
  unassignedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  unassignedButton: {
    flex: 1,
    paddingVertical: 8,
  },
  unassignedRestButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.dark.bg.secondary,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  presetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.dark.accent.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.dark.accent.primary,
  },
  tabButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.secondary,
  },
  activeTabButtonText: {
    color: colors.dark.accent.primary,
  },
  presetsListContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  presetCard: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    overflow: 'hidden',
  },
  presetCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  presetCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.dark.text.primary,
  },
  presetCardDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.secondary,
    lineHeight: 18,
  },
  presetCardDetails: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.tertiary,
  },
  daysContainer: {
    gap: spacing.sm,
  },
  presetDayRow: {
    backgroundColor: colors.dark.bg.secondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
  },
  presetDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetDayLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.tertiary,
  },
  presetWorkoutName: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.dark.accent.primary,
  },
  presetRestDayLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.tertiary,
    fontStyle: 'italic',
  },
  presetExercisesList: {
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle + '50',
    paddingTop: 4,
  },
  presetExercisesHeader: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.dark.text.secondary,
    marginBottom: 2,
  },
  presetExercisesText: {
    fontSize: typography.fontSize.sm,
    color: colors.dark.text.primary,
    lineHeight: 18,
  },
});
