import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, radius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon } from '@/components/Icon';
import { NumpadModal } from '@/components/NumpadModal';
import { useTrainingStore } from '@/store/training.store';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

export default function ActiveSessionScreen() {
  const { t } = useTranslation();
  const { exercises, startSession, addSet, updateSet, toggleSetComplete } = useTrainingStore();

  const [numpad, setNumpad] = useState<{
    visible: boolean;
    type: 'weight' | 'reps';
    value: string;
    exId: string;
    setId: string;
  }>({ visible: false, type: 'weight', value: '', exId: '', setId: '' });

  // Rest Timer State
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
      // Auto-start default rest of 60s when a set is completed
      startRest(60);
    }
  };

  useEffect(() => {
    // Scaffold dummy data if empty just to show the UI
    if (exercises.length === 0) {
      startSession([{ id: '1', name: 'ベンチプレス (Bench Press)' }]);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('session.title'), 
          headerLargeTitle: false,
          headerLeft: () => (
            <Pressable 
              onPress={() => router.back()} 
              hitSlop={8} 
              style={styles.headerBackButton}
            >
              <Icon name="chevron-back" size={20} color={colors.dark.text.primary} />
            </Pressable>
          )
        }} 
      />
      
      <ScrollView 
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        {exercises.map((ex) => (
          <View key={ex.id} style={styles.exerciseContainer}>
            <Text style={styles.exerciseName}>
              {ex.name}
            </Text>
            
            <Card style={styles.exerciseCard}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderSet}>{t('session.sets')}</Text>
                <Text style={styles.tableHeaderMain}>kg</Text>
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
                    <Pressable 
                      onPress={() => !set.completed && setNumpad({ visible: true, type: 'weight', value: set.weight, exId: ex.id, setId: set.id })}
                      style={styles.setInput}
                    >
                      <Text style={[
                        styles.setInputText,
                        { color: set.completed ? colors.dark.text.secondary : colors.dark.text.primary }
                      ]}>{set.weight || '--'} kg</Text>
                    </Pressable>
                  </View>
                  <View style={styles.setInputContainer}>
                    <Pressable 
                      onPress={() => !set.completed && setNumpad({ visible: true, type: 'reps', value: set.reps, exId: ex.id, setId: set.id })}
                      style={styles.setInput}
                    >
                      <Text style={[
                        styles.setInputText,
                        { color: set.completed ? colors.dark.text.secondary : colors.dark.text.primary }
                      ]}>{set.reps || '--'}</Text>
                    </Pressable>
                  </View>
                  <View style={styles.setCheckContainer}>
                    <Pressable 
                      onPress={() => handleToggleComplete(ex.id, set.id, set.completed)}
                      style={[
                        styles.checkCircle,
                        { backgroundColor: set.completed ? colors.dark.accent.success : colors.dark.bg.tertiary }
                      ]}>
                       <Icon name={set.completed ? 'checkmark' : 'checkmark'} size={18} color={set.completed ? colors.dark.bg.primary : colors.dark.text.secondary} />
                    </Pressable>
                  </View>
                </View>
              ))}
              
              <Pressable onPress={() => addSet(ex.id)} style={styles.addSetButton}>
                <View style={styles.addSetContent}>
                  <Icon name="add-circle-outline" size={18} color={colors.dark.accent.info} />
                  <Text style={styles.addSetText}>{t('session.addExercise')}</Text>
                </View>
              </Pressable>
            </Card>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footerContainer}>
        {/* Rest Timer Block */}
        <View style={styles.timerContainer}>
          <View style={styles.timerInfo}>
            <Icon name="timer-outline" size={24} color={restLeft > 0 ? colors.dark.accent.info : colors.dark.text.secondary} />
            <Text style={[
              styles.timerLabel,
              { color: restLeft > 0 ? colors.dark.accent.info : colors.dark.text.secondary }
            ]}>
              {restLeft > 0 ? formatRest(restLeft) : 'Rest Timer'}
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


      <NumpadModal 
        visible={numpad.visible}
        type={numpad.type}
        initialValue={numpad.value}
        onClose={() => setNumpad({ ...numpad, visible: false })}
        onSave={(val) => updateSet(numpad.exId, numpad.setId, { [numpad.type]: val })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg.primary,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.dark.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.base,
    gap: spacing.lg,
  },
  exerciseContainer: {
    gap: spacing.md,
  },
  exerciseName: {
    color: colors.dark.text.primary,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  exerciseCard: {
    padding: 0,
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
    flex: 1,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  tableHeaderMain: {
    flex: 3,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  tableHeaderCheck: {
    flex: 1,
    color: colors.dark.text.secondary,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    padding: spacing.md,
    alignItems: 'center',
  },
  setNumber: {
    flex: 1,
    color: colors.dark.text.primary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  setInputContainer: {
    flex: 3,
    alignItems: 'center',
  },
  setInput: {
    backgroundColor: colors.dark.bg.tertiary,
    padding: spacing.sm,
    borderRadius: radius.md,
    width: '80%',
    alignItems: 'center',
  },
  setInputText: {
    fontVariant: ['tabular-nums'],
  },
  setCheckContainer: {
    flex: 1,
    alignItems: 'center',
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
  },
  addSetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addSetText: {
    color: colors.dark.accent.info,
    fontWeight: 'bold',
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

