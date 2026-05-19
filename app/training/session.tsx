import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { useTrainingStore } from '@/store/training.store';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

export default function ActiveSessionScreen() {
  const { t } = useTranslation();
  const { exercises, startSession, addSet, removeSet, updateSet, toggleSetComplete, updateExerciseNote, removeExercise, reorderSessionExercises } = useTrainingStore();

  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const [restLeft, setRestLeft] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (restLeft > 0) {
      interval = setInterval(() => {
        setRestLeft(prev => {
          if (prev <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [restLeft]);

  const startRest = (seconds: number) => {
    setRestLeft(seconds);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const formatRest = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleComplete = (exId: string, setId: string, currentlyCompleted: boolean) => {
    toggleSetComplete(exId, setId);
    if (!currentlyCompleted && restLeft === 0) {
      startRest(60);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <View style={styles.customHeader}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={8} 
          style={styles.headerBackButton}
        >
          <Icon name="chevron-back" size={24} color={colors.dark.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>{t('session.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        {exercises.map((ex, index) => (
          <View key={ex.id} style={styles.exerciseSection}>
            <View style={styles.exerciseSectionHeader}>
              <View style={styles.exerciseSectionHeaderLeft}>
                <View style={styles.exerciseIconWrapper}>
                  <Icon name="barbell" size={16} color={colors.white} />
                </View>
                <Text style={styles.exerciseName}>{ex.name}</Text>
              </View>
              
              <View style={styles.exerciseActions}>
                {index > 0 && (
                  <Pressable hitSlop={8} onPress={() => reorderSessionExercises(index, index - 1)}>
                    <Icon name="chevron-up" size={20} color={colors.dark.text.secondary} />
                  </Pressable>
                )}
                {index < exercises.length - 1 && (
                  <Pressable hitSlop={8} onPress={() => reorderSessionExercises(index, index + 1)}>
                    <Icon name="chevron-down" size={20} color={colors.dark.text.secondary} />
                  </Pressable>
                )}
                <Pressable hitSlop={8} onPress={() => removeExercise(ex.id)} style={{ marginLeft: 8 }}>
                  <Icon name="trash-outline" size={20} color={colors.dark.accent.primary} />
                </Pressable>
              </View>
            </View>
            
            <TextInput
              style={styles.notesInput}
              placeholder={t('session.addNotes', 'Add notes for this exercise...')}
              placeholderTextColor={colors.dark.text.tertiary}
              value={ex.notes || ''}
              onChangeText={(text) => updateExerciseNote(ex.id, text)}
              multiline
            />
            
            <Card style={styles.exerciseCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderSet}>{t('session.sets')}</Text>
                <Text style={styles.tableHeaderMain}>{t('session.kg')}</Text>
                <Text style={styles.tableHeaderMain}>{t('session.reps')}</Text>
                <Text style={styles.tableHeaderCheck}>✓</Text>
              </View>
              
              {ex.sets.map((set, index) => (
                <View key={set.id} style={[
                  styles.setRow, 
                  { backgroundColor: set.completed ? colors.dark.bg.elevated : colors.transparent }
                ]}>
                  <Text style={styles.setNumber}>{index + 1}</Text>
                  <View style={styles.setInputContainer}>
                    <View style={[
                      styles.inlineInputWrapper,
                      focusedInput === `${set.id}-weight` && styles.inlineInputWrapperFocused,
                      set.completed && styles.inlineInputWrapperCompleted
                    ]}>
                      <Pressable 
                        style={styles.adjustBtn} 
                        hitSlop={12}
                        onPress={() => !set.completed && updateSet(ex.id, set.id, { weight: String(Math.max(0, Number(set.weight || 0) - 1)) })}
                      >
                        <Icon name="remove" size={16} color={set.completed ? colors.dark.text.tertiary : (focusedInput === `${set.id}-weight` ? colors.dark.text.primary : colors.dark.text.secondary)} />
                      </Pressable>
                      <TextInput
                        style={[styles.textInput, set.completed && { color: colors.dark.text.secondary }]}
                        value={set.weight}
                        onChangeText={(val) => updateSet(ex.id, set.id, { weight: val })}
                        onFocus={() => setFocusedInput(`${set.id}-weight`)}
                        onBlur={() => setFocusedInput(null)}
                        keyboardType="decimal-pad"
                        placeholder="--"
                        placeholderTextColor={colors.dark.text.tertiary}
                        editable={!set.completed}
                        selectTextOnFocus
                      />
                      <Pressable 
                        style={styles.adjustBtn} 
                        hitSlop={12}
                        onPress={() => !set.completed && updateSet(ex.id, set.id, { weight: String(Number(set.weight || 0) + 1) })}
                      >
                        <Icon name="add" size={16} color={set.completed ? colors.dark.text.tertiary : (focusedInput === `${set.id}-weight` ? colors.dark.text.primary : colors.dark.text.secondary)} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.setInputContainer}>
                    <View style={[
                      styles.inlineInputWrapper,
                      focusedInput === `${set.id}-reps` && styles.inlineInputWrapperFocused,
                      set.completed && styles.inlineInputWrapperCompleted
                    ]}>
                      <Pressable 
                        style={styles.adjustBtn} 
                        hitSlop={12}
                        onPress={() => !set.completed && updateSet(ex.id, set.id, { reps: String(Math.max(0, Number(set.reps || 0) - 1)) })}
                      >
                        <Icon name="remove" size={16} color={set.completed ? colors.dark.text.tertiary : (focusedInput === `${set.id}-reps` ? colors.dark.text.primary : colors.dark.text.secondary)} />
                      </Pressable>
                      <TextInput
                        style={[styles.textInput, set.completed && { color: colors.dark.text.secondary }]}
                        value={set.reps}
                        onChangeText={(val) => updateSet(ex.id, set.id, { reps: val })}
                        onFocus={() => setFocusedInput(`${set.id}-reps`)}
                        onBlur={() => setFocusedInput(null)}
                        keyboardType="number-pad"
                        placeholder="--"
                        placeholderTextColor={colors.dark.text.tertiary}
                        editable={!set.completed}
                        selectTextOnFocus
                      />
                      <Pressable 
                        style={styles.adjustBtn} 
                        hitSlop={12}
                        onPress={() => !set.completed && updateSet(ex.id, set.id, { reps: String(Number(set.reps || 0) + 1) })}
                      >
                        <Icon name="add" size={16} color={set.completed ? colors.dark.text.tertiary : (focusedInput === `${set.id}-reps` ? colors.dark.text.primary : colors.dark.text.secondary)} />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.setCheckContainer}>
                    <Pressable 
                      onPress={() => removeSet(ex.id, set.id)}
                      hitSlop={8}
                    >
                      <Icon name="trash-outline" size={20} color={colors.dark.text.tertiary} />
                    </Pressable>
                    <Pressable 
                      onPress={() => handleToggleComplete(ex.id, set.id, set.completed)}
                      hitSlop={8}
                      style={[
                        styles.checkCircle,
                        { backgroundColor: set.completed ? colors.dark.accent.success : colors.dark.bg.tertiary }
                      ]}>
                       <Icon name="checkmark" size={18} color={set.completed ? colors.dark.bg.primary : colors.dark.text.secondary} />
                    </Pressable>
                  </View>
                </View>
              ))}
              
              <Pressable onPress={() => addSet(ex.id)} style={styles.addSetButton}>
                <View style={styles.addSetContent}>
                  <Icon name="add-circle" size={20} color={colors.dark.accent.primary} />
                  <Text style={styles.addSetText}>{t('session.addSet', 'Add Set')}</Text>
                </View>
              </Pressable>
            </Card>
          </View>
        ))}
        
        <Pressable style={styles.globalAddExerciseBtn}>
           <Icon name="add" size={20} color={colors.dark.text.primary} />
           <Text style={styles.globalAddExerciseText}>{t('session.addExercise')}</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footerContainer}>
        <View style={styles.timerContainer}>
          <View style={styles.timerInfo}>
            <Icon name="timer-outline" size={24} color={restLeft > 0 ? colors.dark.accent.info : colors.dark.text.secondary} />
            <Text style={[
              styles.timerLabel,
              { color: restLeft > 0 ? colors.dark.accent.info : colors.dark.text.secondary }
            ]}>
              {restLeft > 0 ? formatRest(restLeft) : t('session.restTimer')}
            </Text>
          </View>
          <View style={styles.timerPresets}>
             <Pressable onPress={() => startRest(60)} style={styles.presetButton}>
               <Text style={styles.presetText}>1:00</Text>
             </Pressable>
             <Pressable onPress={() => startRest(90)} style={styles.presetButton}>
               <Text style={styles.presetText}>1:30</Text>
             </Pressable>
             <Pressable onPress={() => startRest(120)} style={styles.presetButton}>
               <Text style={styles.presetText}>2:00</Text>
             </Pressable>
          </View>
        </View>

        <Button 
          label={t('session.finish')} 
          iconName="checkmark-done"
          fullWidth
          onPress={() => router.push('/modals/session-summary')}
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
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.xl,
  },
  exerciseSection: {
    gap: spacing.md,
  },
  exerciseSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseSectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exerciseIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.dark.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.dark.bg.tertiary,
    color: colors.dark.text.primary,
    padding: spacing.sm,
    borderRadius: radius.md,
    fontSize: typography.fontSize.sm,
    minHeight: 40,
  },
  exerciseCard: {
    padding: 0,
    borderWidth: 1,
    borderColor: colors.dark.border.subtle,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.dark.bg.elevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border.subtle,
  },
  tableHeaderSet: {
    width: 40,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  tableHeaderMain: {
    flex: 2.5,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  tableHeaderCheck: {
    flex: 1.5,
    color: colors.dark.text.secondary,
    textAlign: 'right',
  },
  setRow: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  setNumber: {
    width: 40,
    color: colors.dark.text.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  setInputContainer: {
    flex: 2.5,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  inlineInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
    height: 36,
    width: '100%',
  },
  inlineInputWrapperFocused: {
    borderColor: colors.dark.accent.primary,
    backgroundColor: colors.dark.bg.secondary,
  },
  inlineInputWrapperCompleted: {
    backgroundColor: 'transparent',
  },
  adjustBtn: {
    paddingHorizontal: 6,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    color: colors.dark.text.primary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    fontWeight: 'bold',
    padding: 0,
  },
  setCheckContainer: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetButton: {
    padding: spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    backgroundColor: colors.dark.bg.secondary,
  },
  addSetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addSetText: {
    color: colors.dark.accent.primary,
    fontWeight: 'bold',
  },
  globalAddExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.dark.border.default,
    backgroundColor: colors.dark.bg.tertiary,
    marginTop: spacing.sm,
  },
  globalAddExerciseText: {
    color: colors.dark.text.primary,
    fontWeight: 'bold',
    fontSize: typography.fontSize.base,
  },
  footerContainer: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
    backgroundColor: colors.dark.bg.elevated,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border.subtle,
    gap: spacing.md,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.dark.bg.secondary,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  timerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  timerPresets: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  presetButton: {
    padding: spacing.xs,
    backgroundColor: colors.dark.bg.tertiary,
    borderRadius: radius.sm,
  },
  presetText: {
    color: colors.dark.text.primary,
  },
});

